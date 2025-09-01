import { defineConfig } from 'vite'
import fs from 'fs'
import yaml from 'js-yaml'
import react from '@vitejs/plugin-react'

function getConfig() {
  try {
    const configPath = '../cfg.yaml'
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const config = yaml.load(fileContents) as any
    return config
  } catch (error) {
    console.warn('Could not read cfg.yaml, B=5999, F=6999')
    return { backend_port: '5999', frontend_port: '6999' }
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(getConfig().frontend_port),
    host: '0.0.0.0',
  },
  define: {
    BACKEND_PORT: JSON.stringify(getConfig().backend_port),
  }
})