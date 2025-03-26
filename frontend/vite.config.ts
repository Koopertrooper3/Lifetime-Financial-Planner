import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import IstanbulPlugin from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    [IstanbulPlugin({
      include: 'src/*',
      exclude: ['node_modules', 'test/'],
      extension: [ '.js', '.ts','.tsx' ],
    })
  ]
  
  ],
})
