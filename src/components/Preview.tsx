'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Previewer } from 'pagedjs';
import html2pdf from 'html2pdf.js';

interface PreviewProps {
    html: string;
    title: string;
}

const Preview: React.FC<PreviewProps> = ({ html, title }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewReady, setIsPreviewReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const previewerRef = useRef<Previewer | null>(null);
    const previousHtmlRef = useRef<string>('');

    console.log(html)

    // Get the current theme
    const isDarkMode = document.documentElement.classList.contains('dark');

    const createFormattedContent = (htmlContent: string) => {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* Base page settings */
                        @page {
                            size: A4;
                            margin: 2cm;
                        }
                        
                        /* CSS Variables for theming */
                        :root {
                            --background: ${isDarkMode ? 'hsl(0 0% 3.9%)' : 'hsl(0 0% 100%)'};
                            --foreground: ${isDarkMode ? 'hsl(0 0% 98%)' : 'hsl(0 0% 3.9%)'};
                            --muted: ${isDarkMode ? 'hsl(0 0% 14.9%)' : 'hsl(0 0% 96.1%)'};
                            --muted-foreground: ${isDarkMode ? 'hsl(0 0% 63.9%)' : 'hsl(0 0% 45.1%)'};
                            --border: ${isDarkMode ? 'hsl(0 0% 14.9%)' : 'hsl(0 0% 89.8%)'};
                        }
                        
                        /* Basic document styling */
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            line-height: 1.5;
                            margin: 0;
                            padding: 0;
                            background: var(--background);
                            color: var(--foreground);
                        }

                        /* Content styling matching your TipTap styles */
                        .preview-content {
                            max-width: 100%;
                            margin: 0 auto;
                            
                            /* Headings */
                            & h1 {
                                font-size: 1.875rem;
                                line-height: 1.2;
                                margin: 2.5rem 0 1.5rem;
                            }
                            
                            & h2 {
                                font-size: 1.5rem;
                                line-height: 1.2;
                                margin: 2.5rem 0 1.5rem;
                            }
                            
                            & h3 {
                                font-size: 1.25rem;
                                line-height: 1.2;
                                margin: 2rem 0 1rem;
                            }
                            
                            & h4, & h5, & h6 {
                                font-size: 1.125rem;
                                line-height: 1.2;
                                margin: 1.5rem 0 1rem;
                            }
                            
                            /* Rest of your styles remain the same */
                        }

                        /* Paged.js specific styling */
                        .pagedjs_pages {
                            max-width: 100%;
                            margin: 0 auto;
                        }

                        .pagedjs_page {
                            background: var(--background);
                            margin: 0.5cm auto;
                            box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.1);
                        }

                        @media print {
                            body { background: none; }
                            .pagedjs_page { box-shadow: none; }
                            :root {
                                --background: white;
                                --foreground: black;
                                --muted: #f1f1f1;
                                --muted-foreground: #666;
                                --border: #ddd;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="preview-content">${htmlContent}</div>
                </body>
            </html>
        `.trim();
    };

    // Function to check if Paged.js has finished rendering
    const isPagedJSComplete = (container: HTMLElement): boolean => {
        const pages = container.querySelectorAll('.pagedjs_page');
        return pages.length > 0 && Array.from(pages).every(page => {
            const content = page.querySelector('.pagedjs_page_content');
            return content ? content?.children.length > 0 : false;
        });
    };

    // Function to wait for Paged.js rendering to complete
    const waitForPagedJS = async (container: HTMLElement): Promise<void> => {
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (isPagedJSComplete(container)) {
                await new Promise(resolve => setTimeout(resolve, 200));
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        throw new Error('Preview generation timed out');
    };

    // Initialize or update the preview
    const updatePreview = async () => {
        if (!contentRef.current || html === previousHtmlRef.current) return;

        try {
            setIsPreviewReady(false);
            setError(null);

            // Clear previous content
            if (contentRef.current.firstChild) {
                contentRef.current.innerHTML = '';
            }

            // Create new previewer instance
            previewerRef.current = new Previewer();

            // Generate the preview
            await previewerRef.current.preview(
                createFormattedContent(html),
                [],
                contentRef.current
            );

            // Wait for rendering to complete
            await waitForPagedJS(contentRef.current);
            previousHtmlRef.current = html;
            setIsPreviewReady(true);

        } catch (error) {
            console.error('Preview initialization failed:', error);
            setError('Failed to generate preview. Please try again.');
            setIsPreviewReady(false);
        }
    };

    // Handle PDF generation
    const handleDownload = async () => {
        if (!contentRef.current || !isPreviewReady) {
            setError('Preview is not ready yet. Please wait.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const pagesContainer = contentRef.current.querySelector('.pagedjs_pages');
            if (!pagesContainer) {
                throw new Error('Could not find rendered content');
            }

            const pdfContent = pagesContainer.cloneNode(true) as HTMLElement;
            pdfContent.querySelectorAll('style, script').forEach(el => el.remove());

            const opt = {
                margin: [20, 20, 20, 20],
                filename: `${title || 'document'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            await html2pdf()
                .from(pdfContent)
                .set(opt)
                .save();

        } catch (error) {
            console.error('PDF generation failed:', error);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Effect to handle content updates
    useEffect(() => {
        updatePreview();

        return () => {
            previewerRef.current = null;
            setIsPreviewReady(false);
            setError(null);
        };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-4">
                {error && (
                    <div className="text-destructive text-sm">{error}</div>
                )}
                <div className="flex-grow"></div>
                <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    disabled={isGenerating || !isPreviewReady}
                >
                    {isGenerating ? (
                        <>
                            <svg
                                className="animate-spin h-4 w-4 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Generating PDF...
                        </>
                    ) : (
                        'Download PDF'
                    )}
                </Button>
            </div>
            <div
                ref={contentRef}
                className={`w-full flex-1 bg-background print:p-0 ${!isPreviewReady ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'
                    }`}
            />
        </div>
    );
};

export default Preview;