# Arquitetura

Modo integrado: Sinuous e Canvas consome WHATWG Router e Yup na mesma origem. SSR entrega conteúdo editorial, imagens, metadados e navegação. ClientBoot monta o bundle após a hidratação do documento para evitar conflito entre runtimes.

`server/service.mjs`: domínio, validação e exportador. `api.mjs`: router próprio da stack. `routes.mjs`: operações. `store.mjs`: D1, revisão, autorização e TTL. `transport.mjs`: corpo limitado e erros padronizados.

Massas unitárias, hastes sem massa, sem atrito, g=9,81 m/s². Equações acopladas, RK4 a 240 Hz, amostras a 60 Hz por 2–12 s. Diferença inicial de 0–1°. Invariantes de comprimento e energia testados; não é medição experimental.

Cada registro possui UUID, receita JSON, digest SHA-256 de token de 256 bits, revisão e timestamps UTC. UPDATE condicional por revisão impõe CAS. Contador atômico limita criações por hora UTC. Exclusão só do próprio recurso. Cliente guarda no máximo doze capacidades por aba e nunca as põe no URL.



Testes de integração usam Miniflare e migrações reais em diretório temporário. Smoke cria e remove somente seu próprio registro sintético. Não há reset público ou operação administrativa no cliente.
