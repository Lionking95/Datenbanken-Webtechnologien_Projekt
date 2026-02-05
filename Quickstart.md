# Quickstart Webtechnologien Projekt

## VM Setup

### Prerequisites
- VirtualBox or any compatible virtualization software
- Download the feusi-VM image
- Link to download: https://tinyurl.com/feusi-vm

### Steps to Install and Run the VM
1. Open your virtualization software (e.g., VirtualBox).
2. Click on "Import Appliance" or similar option.
3. Select the downloaded feusi-VM image file.
4. Follow the prompts to complete the import process.
5. Start the VM once the import is complete.

### Access the VM
- Username: `feusi`
- Password: `feusi`

## Setup database and REST API
Open a terminal in the VM and run the following commands:

```bash
git clone https://github.com/leandrolerena/w3schools-database
cd w3schools-database  # Wechselt in den neuen Ordner w3schools-database
git pull  # update repository
docker-compose up -d  # (wenn es probleme gibt, system neustarten)
code .  # Startet Visual Studio Code im aktuellen Ordner
```

### Access the Database
- Server: `localhost`
- Port: `3309`
- Username: `feusi`
- Password: `feusi`
- Database: `w3schools`

### Test the Database
Open SQL Tools in Visual Studio Code and check the connection to the database.
- Connect to the database
- Run a test query to ensure everything is working correctly

```sql
SELECT * FROM customers;
``` 

If the query returns results, the database is set up correctly.

### Access the REST API
Open your web browser and navigate to:
```
http://localhost:3000/customers
```

### Troubleshooting
If you encounter any issues, ensure that Docker is running and that the containers are up. You can check the status of the containers with:
```bash
docker ps
```
If the containers are not running, you can start them with:
```bash
docker-compose up -d
```

## Web Application with Next.js
### Install Node.js and npm
Make sure Node.js and npm are installed in your VM. You can install them using the following commands:

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"
# Download and install Node.js:
nvm install 24
# Verify the Node.js version:
node -v # Should print "v24.13.0".
# Verify npm version:
npm -v # Should print "11.6.2".
```

### Create a Next.js app
Next.js is a popular React framework for building web applications. It provides server-side rendering, static site generation, and many other features out of the box.

In a new terminal window, run the following commands to create a new React application, from within the `w3schools-database` folder:

```bash
npx create-next-app@latest

# set a name like web-app
# use recommended default settings for node
```

### Change the port of the Next.js app
By default, Next.js runs on port 3000, which conflicts with our REST API.
To change the port, open the `package.json` file in the newly created Next.js app folder and modify the `dev` script as follows:

```json
"scripts": {
  "dev": "next dev -p 3001",
  ...   
}
```

### Run the Next.js app
Navigate to the Next.js app folder and start the development server:

```bash
cd web-app
npm run dev
```

Open your web browser and navigate to:
```
http://localhost:3001
```
You should see the default Next.js welcome page.

## Connect Next.js app to the REST API
Now that you have both the REST API and the Next.js app running, you can connect the Next.js app to the REST API to fetch and display data.

### Understand the Project Structure
Familiarize yourself with the project structure of both the Next.js app and the REST API. This will help you understand where to add your code and how to organize your files effectively.
- Next.js App: Explore the `app`, and `public` directories.
- REST API: Explore the `app.js` and how it dynamically serves data from the database.

### Initial first API call from Next.js
To fetch data from the REST API in your Next.js app, you can use the `fetch` function inside a React component. Here's an example of how to fetch and display data from the REST API.
Create a new file `lib/api.ts` in your Next.js app folder with the following content:

```typescript
// lib/api.ts
export async function fetchFromApi<T>(endpoint: string): Promise<T> {
    const apiBase = process.env.API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiBase}${endpoint}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  }
  
  // Example specific function for products
  export async function getProducts() {
    return fetchFromApi<{ ProductID: number; ProductName: string; Price: number }[]>('/products');
  }
```

Then create a new file `app/products/page.tsx` with the following content:

```typescript
import { getProducts } from '@/lib/api';

// Force this page to be rendered at runtime
export const dynamic = 'force-dynamic';

export default async function Page() {
  let products = [] as { ProductID: number; ProductName: string; Price: number }[];
  try {
    products = await getProducts();
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.ProductID} className="border rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-semibold">{product.ProductName}</h2>
          <p className="text-gray-500">Price: ${product.Price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

Now, when you navigate to `http://localhost:3001/products`, you should see a list of products fetched from the REST API.

## Setup Docker to bundle all together
If you need to modify the Docker setup, you can edit the `docker-compose.yml` file in the `w3schools-database` folder. This file defines the services, networks, and volumes for your application.
Check that the new web-app has also a Dockerfile to build a container for it.

Dockerfile example for Next.js app:

```web-app/Dockerfile
# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV API_URL=http://rest-api:3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

Then, update the `docker-compose.yml` to include the new service:

```yaml
version: "3.1"

services:
  w3schools-db:
    image: biarms/mysql:5.7
    # image: mysql:8
    restart: always
    environment:
      MYSQL_USER: feusi
      MYSQL_PASSWORD: feusi
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: w3schools
    volumes:
      - ./data/mysql-arm:/var/lib/mysql
      - ./init-mysql:/docker-entrypoint-initdb.d
    ports:
      # Use non standard port to avoid clashes
      - 3309:3306

  rest-api:
    build: ./rest-api
    restart: always
    depends_on:
      - w3schools-db
    ports:
      - 3000:3000
    environment:
      - DB_HOST=w3schools-db
      - DB_PORT=3306

  web-app:
    build: ./web-app
    restart: always
    depends_on:
      - rest-api
    ports:
      - 8080:3001
    environment:
      - API_URL=http://rest-api:3000
```

Finally, run the following command to build and start all services:

```bash
docker-compose up -d --build
```
Now, you can access your Next.js app at:
```
http://localhost:8080
```

You can also see the products page at:
```
http://localhost:8080/products
```

Whenever you make changes to the Next.js app, you will need to rebuild the Docker image for the web-app service. You can do this by running:

```bash
docker-compose down
docker-compose up -d --build
```

## Next steps
You can alternatively remove the complete `w3schools-database` folder and clone it again from `https://github.com/yveseinfeldt/w3schools-database` to get the latest version with the `web-app` folder included.

### Implement features
Start implementing the features required for your web application. Use the Next.js documentation and REST API to fetch and display data as needed. Consider adding routing, styling, and interactivity to enhance the user experience.

Remove the `web-app` service from the `docker-compose.yml` file while developing locally to speed up your workflow. You can run the Next.js app directly using `npm run dev` in the `web-app` folder. So you don't need to rebuild the Docker image after every change.

Ensure that the REST API is running in Docker while you are developing the Next.js app locally, so that the Next.js app can fetch data from it.

### Write the journal and document your work
Update your project journal with the steps you have taken, any challenges you faced, and how you overcame them. This documentation will be valuable for future reference and for sharing your experience with others.
Check the `Readme.md` file in the `w3schools-database` folder for guidance on how to document your work effectively.

### More information
Explore the Next.js documentation for more information on how to create pages, fetch data, and style your application: https://nextjs.org/docs
