# Campanha — Modelos de Preço

## Plano Standard — D-ID  
**R$ 397 / mês** · Piloto exclusivo

- 5 vídeos de campanha por mês
- Avatar do candidato (D-ID V3 Instant Avatar)
- Roteirista IA (Gemini 2.5 Flash)
- Clonagem de voz (ElevenLabs)
- Links rastreáveis + analytics
- Compartilhamento direto (WhatsApp, Facebook, Telegram)
- Suporte via WhatsApp

**Env vars necessárias:**
```
DID_API_KEY=...
GEMINI_API_KEY=...
BLOB_READ_WRITE_TOKEN=...
```

---

## Plano Premium — HeyGen  
**R$ 697 / mês**

Tudo do Plano Standard, mais:
- Motor de vídeo HeyGen (qualidade premium, renderização mais rápida)
- Avatar criado no painel HeyGen (processo simplificado, sem etapa de consentimento no app)
- Suporte prioritário

**Env vars adicionais (Vercel dashboard):**
```
HEYGEN_API_KEY=...
CAMPANHA_VIDEO_PROVIDER=heygen
NEXT_PUBLIC_CAMPANHA_VIDEO_PROVIDER=heygen
```

**Para o avatar HeyGen:**
O operador cria o avatar em app.heygen.com → Avatars → Instant Avatar, e fornece
o Avatar ID ao candidato para colar em Configurações → D-ID API Key (campo reutilizado
para o ID do avatar no plano HeyGen).

**Para ativar o plano Premium (upgrade de um cliente):**
1. Cliente paga R$ 300/mês de diferença
2. Operador cria avatar HeyGen e anota o Avatar ID
3. No painel Vercel do projeto do cliente, adicionar as 3 vars acima
4. Redeployar — tudo mais (scripts, analytics, compartilhamento) continua igual

---

## Comparação

| | Standard (D-ID) | Premium (HeyGen) |
|--|--|--|
| Preço | R$ 397/mês | R$ 697/mês |
| Motor de vídeo | D-ID V3 | HeyGen |
| Criação de avatar | No app (etapas guiadas) | No painel HeyGen |
| Clonagem de voz | ElevenLabs | ElevenLabs |
| Vídeos/mês | 5 (configurável) | 5 (configurável) |
| Roteirista IA | ✅ | ✅ |
| Analytics | ✅ | ✅ |
| Banner TSE | tecnologia D-ID | tecnologia HeyGen |

---

## Configurar limite de vídeos

O limite padrão é 5 vídeos/mês. Para alterar:

```
CAMPANHA_MONTHLY_VIDEO_LIMIT=10
```

Definir por projeto no painel Vercel (cada cliente = um projeto separado).
