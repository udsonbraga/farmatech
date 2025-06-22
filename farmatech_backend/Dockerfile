# Dockerfile para o Backend (Django com Gunicorn)
# Localização: farmatech/farmatech_backend/Dockerfile

# Usa uma imagem base Python Alpine para ser leve
FROM python:3.9-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Define variáveis de ambiente para que o Python não escreva .pyc
ENV PYTHONUNBUFFERED 1

# Instala dependências do sistema necessárias para o Django e psycopg2-binary (PostgreSQL)
RUN apk add --no-cache postgresql-client build-base

# Instala as dependências Python
# Copia requirements.txt primeiro para aproveitar o cache do Docker
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copia o restante do código fonte do backend para o diretório de trabalho
COPY . /app/farmatech_backend

# Navega para o diretório do projeto Django
WORKDIR /app/farmatech_backend

# Expõe a porta que o Gunicorn vai escutar
EXPOSE 8000

# Comando para iniciar o servidor Gunicorn
# Certifique-se de que as variáveis de ambiente DATABASE_URL, SECRET_KEY, DEBUG, ALLOWED_HOSTS estejam configuradas no ambiente de execução (ECS Task Definition)
# Você também pode executar as migrações aqui, mas é mais comum fazer isso como um passo separado ou durante o deployment orchestration (ex: ECS Task)
CMD ["gunicorn", "farmatech_backend.wsgi:application", "--bind", "0.0.0.0:8000"]

