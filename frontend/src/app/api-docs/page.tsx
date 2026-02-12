"use client";

import React, { useEffect, useRef } from 'react';
import Head from 'next/head';

export default function ApiDocsPage() {
    const swaggerRef = useRef<boolean>(false);

    useEffect(() => {
        if (swaggerRef.current) return;
        swaggerRef.current = true;

        const loadStylesAndScripts = async () => {
            // Load CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css';
            document.head.appendChild(link);

            // Load Bundle script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                // Load Preset script
                const presetScript = document.createElement('script');
                presetScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js';
                presetScript.async = true;
                document.body.appendChild(presetScript);

                presetScript.onload = () => {
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://medical-ai-uh9j-backend.vercel.app';

                    // @ts-ignore
                    window.ui = SwaggerUIBundle({
                        url: `${backendUrl}/api/docs-json`,
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [
                            // @ts-ignore
                            SwaggerUIBundle.presets.apis,
                            // @ts-ignore
                            SwaggerUIStandalonePreset
                        ],
                        plugins: [
                            // @ts-ignore
                            SwaggerUIBundle.plugins.DownloadUrl
                        ],
                        layout: "StandaloneLayout",
                        persistAuthorization: true,
                    });
                };
            };
        };

        loadStylesAndScripts();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <style jsx global>{`
                .swagger-ui .topbar { display: none !important; }
                .swagger-ui .info { margin: 30px 0 !important; }
                .swagger-ui .scheme-container { 
                    padding: 20px 0 !important; 
                    background: #f8fafc !important;
                    border-top: 1px solid #e2e8f0 !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
            `}</style>
            <div id="swagger-ui" />
        </div>
    );
}
