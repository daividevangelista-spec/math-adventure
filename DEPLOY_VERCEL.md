# 🚀 Guia de Implantação Vercel

Siga este passo a passo para colocar seu app online e acessível de qualquer lugar.

## Opção 1: Via Terminal (Recomendado para agilidade)

1.  **Instale o Vercel CLI** (Caso não tenha):
    ```bash
    npm install -g vercel
    ```
2.  **Faça o Build Local** (Opcional, mas bom para testar):
    ```bash
    npm run build
    ```
3.  **Inicie o Deploy**:
    ```bash
    vercel
    ```
    - Siga as instruções na tela (Y/Enter para a maioria).
    - Ele irá criar um link de "Preview".
4.  **Subir para Produção**:
    ```bash
    vercel --prod
    ```

---

## Opção 2: Via Painel da Vercel (Visual)

1.  Suba seu código para o **GitHub** (ou GitLab/Bitbucket).
2.  Acesse [vercel.com](https://vercel.com) e faça login.
3.  Clique em **"Add New"** -> **"Project"**.
4.  Importe seu repositório.
5.  Nas configurações:
    - **Framework Preset**: Vite
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
6.  Clique em **Deploy**!

---

## 🛠️ Resolvendo Problemas Comuns

- **Variáveis de Ambiente**: Se usar Supabase, lembre-se de adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto na Vercel (aba "Environment Variables"). No seu caso atual, as chaves estão hardcoded, então ele funcionará direto!
- **SPA Routing**: O app usa roteamento React. A Vercel cuida disso automaticamente com o preset do Vite, mas se as rotas derem 404 ao atualizar a página, crie um arquivo `vercel.json` na raiz com:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

---

🎉 **Pronto!** Seu domínio será algo como `operacoes-matematicas.vercel.app`.
