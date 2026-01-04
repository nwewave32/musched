import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app'
import { setupForegroundMessageListener } from '@shared/lib/fcm'

// FCM Foreground 메시지 리스너 설정
setupForegroundMessageListener();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
