import { client } from "./client";
export function model(
  slug: string,
  notify: () => void,
  paint: (r: any) => void = () => {},
) {
  const api = client(slug);
  const d: any = {
    catalog: null,
    input: null,
    result: null,
    title: "",
    busy: false,
    status: "Preparando a experiência…",
    error: "",
    link: "",
    confirmed: "",
    archive: [],
    current: null,
    owns: false,
  };
  const update = () => {
    d.current = api.current;
    d.owns = api.owns;
    d.archive = api.archive();
    notify();
  };
  const problem = (e: any) => {
    d.error = e?.message || "O serviço não respondeu.";
    d.status = "Não foi possível concluir.";
  };
  const task = async (fn: () => Promise<void>) => {
    if (d.busy) return;
    d.busy = true;
    d.error = "";
    update();
    try {
      await fn();
    } catch (e) {
      problem(e);
    } finally {
      d.busy = false;
      update();
    }
  };
  const result = (r: any) => {
    d.result = r;
    d.confirmed = JSON.stringify(d.input);
    paint(r);
  };
  const openData = async (id: string) => {
    const r = await api.open(id);
    d.input = { ...r.input };
    d.title = r.title;
    result(r.result);
    d.link = r.published ? location.origin + "/?record=" + r.id : "";
    d.status = r.locked
      ? "Selada. A mensagem será liberada pelo relógio do servidor."
      : api.owns
        ? "Registro relido do banco."
        : "Registro compartilhado. Você pode criar uma cópia.";
  };
  const actions = {
    d,
    api,
    init: () =>
      task(async () => {
        d.catalog = await api.catalog();
        d.input = { ...d.catalog.default_input };
        d.title =
          slug === "postera" ? "Para um outro dia" : "Estudo sem título";
        const id = new URL(location.href).searchParams.get("record");
        if (id) await openData(id);
        else {
          result(await api.compute(d.input));
          d.status = "Pronto para experimentar.";
        }
      }),
    change: (key: string, value: any) => {
      d.input = { ...d.input, [key]: value };
      d.status = "Alterações pendentes de calcular e guardar.";
      update();
    },
    title: (value: string) => {
      d.title = value;
    },
    run: () =>
      task(async () => {
        result(await api.compute(d.input));
        d.status = "Cálculo concluído no servidor.";
      }),
    preset: (p: any) =>
      task(async () => {
        api.fresh();
        d.input = { ...p.input };
        d.link = "";
        result(await api.compute(d.input));
        d.status = "Configuração aplicada. Guarde para criar um link.";
      }),
    open: (id: string) => task(() => openData(id)),
    save: () =>
      task(async () => {
        if (d.confirmed !== JSON.stringify(d.input))
          throw new Error("Calcule a configuração antes de guardar.");
        if (d.current?.published && slug === "postera")
          throw new Error("Esta cápsula já está selada. Crie uma nova.");
        const r = await api.save(d.title, d.input);
        d.status = "Guardado no banco · revisão " + r.revision;
      }),
    share: () =>
      task(async () => {
        if (!d.current) throw new Error("Guarde antes de criar o link.");
        if (
          JSON.stringify(d.input) !== JSON.stringify(d.current.input) ||
          d.title !== d.current.title
        )
          throw new Error("Guarde as alterações antes de compartilhar.");
        d.link = await api.share(
          slug === "postera" ? true : !d.current.published,
        );
        if (!api.current?.published) d.link = "";
        d.status =
          slug === "postera"
            ? "Cápsula selada. Guarde o link para abrir depois."
            : d.link
              ? "Link público de leitura criado."
              : "Link encerrado. Registro privado.";
        if (slug === "postera") await openData(api.current!.id);
      }),
    download: () =>
      task(async () => {
        await api.export();
        d.status = "Arquivo da revisão salva exportado.";
      }),
    fresh: () => {
      if (d.busy) return;
      api.fresh();
      d.link = "";
      d.input = { ...d.catalog.default_input };
      d.result = null;
      d.confirmed = "";
      d.title = slug === "postera" ? "Para um outro dia" : "Estudo sem título";
      d.status = "Novo registro. O anterior foi preservado.";
      update();
    },
  };
  return actions;
}
