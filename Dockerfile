# Dockerfile para o Frontend (React com Nginx)
# Localização: farmatech/Dockerfile (na raiz do projeto)

# --- ESTÁGIO 1: Build da Aplicação React ---
FROM node:20-alpine as build-stage

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia package.json e package-lock.json (ou yarn.lock) da raiz do contexto de build
# para instalar dependências.
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o conteúdo da raiz do projeto para o diretório /app no contêiner
# Isso incluirá src/, public/, vite.config.ts, etc.
COPY . .

# Constrói a aplicação React para produção
# Certifique-se de que seu 'package.json' tem um script 'build' que gera para a pasta 'dist'
# E que REACT_APP_API_BASE_URL no seu código React chama '/api' (rota para o backend via Nginx)
RUN npm run build

# --- ESTÁGIO 2: Servir a Aplicação com Nginx ---
FROM nginx:stable-alpine as production-stage

# Copia a configuração customizada do Nginx da raiz do contexto de build
# Certifique-se de que 'nginx.conf' esteja na raiz do seu projeto.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos de build do estágio anterior (que foram gerados em /app/dist)
# para o diretório de serviço do Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expõe a porta 80 para acesso HTTP
EXPOSE 80

# Comando para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]
