import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * Adaptador que traduz o build do Next para um Worker.
 *
 * O cache incremental fica no padrão (em memória do isolate). Ligar o cache em
 * R2 ou KV é o próximo passo natural quando o site tiver tráfego, mas exige
 * outro bucket e outra ligação — não entra junto com a migração para não
 * misturar duas mudanças num diagnóstico só.
 */
export default defineCloudflareConfig()
