'use client'
import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already dismissed prompt
        if (localStorage.getItem('pwa-dismissed')) return

        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)
            // Update UI notify the user they can install the PWA
            setIsVisible(true)
        }

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false)
        } else {
            window.addEventListener('beforeinstallprompt', handler)
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        // Hide the app provided install promotion
        setIsVisible(false)
        // Show the install prompt
        if (deferredPrompt) {
            deferredPrompt.prompt()
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice
            // Optionally, send analytics event with outcome of user choice
            console.log(`User response to the install prompt: ${outcome}`)
            // We've used the prompt, and can't use it again, throw it away
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        // Ideally don't show again for this session or ever?
        // Let's hide it for now.
    }

    if (!isVisible) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: 80, // Above NavBar
            left: 16,
            right: 16,
            background: '#2563eb', // slightly darker blue
            color: 'white',
            padding: '12px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)',
            zIndex: 9999,
            maxWidth: 500,
            margin: '0 auto'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: 8,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Download size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>アプリをインストール</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>ホーム画面に追加して便利に利用</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.8)',
                        border: 'none',
                        fontSize: '1.2rem',
                        lineHeight: 1,
                        cursor: 'pointer',
                        padding: 4
                    }}
                >
                    ×
                </button>
                <button
                    onClick={handleInstall}
                    style={{
                        background: 'white',
                        color: '#2563eb',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    追加
                </button>
            </div>
        </div>
    )
}
