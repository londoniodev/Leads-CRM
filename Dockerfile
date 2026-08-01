# Imagen base oficial Node.js v20 Alpine
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el proyecto completo
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar aplicación Next.js para producción
RUN npm run build

# Exponer el puerto por defecto de Next.js
EXPOSE 3000

# Comando de inicio predeterminado
CMD ["npm", "start"]
