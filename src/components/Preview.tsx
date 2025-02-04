'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Previewer } from 'pagedjs';
import html2pdf from 'html2pdf.js';

interface PreviewProps {
    html: string;       // The HTML content to be previewed and converted to PDF
    title: string;      // The title of the document
}

const Preview: React.FC<PreviewProps> = ({ html, title }) => {
    // State management for the preview and PDF generation process
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewReady, setIsPreviewReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string>(html);

    // Refs to maintain references to DOM elements and the Paged.js previewer
    const contentRef = useRef<HTMLDivElement>(null);
    const previewerRef = useRef<Previewer | null>(null);

    // Function to prepare HTML content for the preview
    // This wraps the content with necessary styling and structure
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
                        
                        /* Basic document styling */
                        body {
                            font-family: system-ui, -apple-system, sans-serif;
                            line-height: 1.5;
                            margin: 0;
                            padding: 0;
                            color: #000;
                            font-size: 12pt;
                        }

                        /* Content styling */
                        .preview-content {
                            max-width: 100%;
                            margin: 0 auto;
                        }

                        /* Paged.js specific styling for preview only */
                        .pagedjs_pages {
                            max-width: 100%;
                            margin: 0 auto;
                        }

                        .pagedjs_page {
                            background: white;
                            margin: 0.5cm auto;
                            box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.1);
                        }

                        /* Print-specific styles */
                        @media print {
                            body {
                                background: none;
                            }
                            .pagedjs_page {
                                box-shadow: none;
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
            return content?.children.length > 0;
        });
    };

    // Function to wait for Paged.js rendering to complete
    const waitForPagedJS = async (container: HTMLElement): Promise<void> => {
        const maxAttempts = 50;  // Maximum number of attempts (5 seconds total)
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (isPagedJSComplete(container)) {
                // Add a small delay to ensure final render is complete
                await new Promise(resolve => setTimeout(resolve, 200));
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        throw new Error('Preview generation timed out');
    };

    // Handler for PDF generation
    const handleDownload = async () => {
        if (!contentRef.current || !isPreviewReady) {
            setError('Preview is not ready yet. Please wait.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Get the content area that contains the rendered pages
            const pagesContainer = contentRef.current.querySelector('.pagedjs_pages');
            if (!pagesContainer) {
                throw new Error('Could not find rendered content');
            }

            // Clone the content to avoid modifying the display
            const pdfContent = pagesContainer.cloneNode(true) as HTMLElement;

            // Remove any unnecessary elements
            pdfContent.querySelectorAll('style, script').forEach(el => el.remove());

            // Configure html2pdf options for optimal output
            const opt = {
                margin: [20, 20, 20, 20],  // [top, left, bottom, right] margins in mm
                filename: `${title || 'document'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,              // Higher scale for better quality
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

            // Generate the PDF using html2pdf worker
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

    // Initialize the preview when content changes
    useEffect(() => {
        const initializePreview = async () => {
            if (!contentRef.current) return;

            try {
                setIsPreviewReady(false);
                setError(null);

                // Create or reuse the Paged.js previewer
                if (!previewerRef.current) {
                    previewerRef.current = new Previewer();
                }

                // Generate the preview using Paged.js
                await previewerRef.current.preview(
                    createFormattedContent(html),
                    [],
                    contentRef.current
                );

                // Wait for the preview to be fully rendered
                await waitForPagedJS(contentRef.current);
                setIsPreviewReady(true);

            } catch (error) {
                console.error('Preview initialization failed:', error);
                setError('Failed to generate preview. Please try again.');
                setIsPreviewReady(false);
            }
        };

        initializePreview();

        // Cleanup on unmount or content change
        return () => {
            previewerRef.current = null;
            setIsPreviewReady(false);
            setError(null);
        };
    }, []);

    // Render the preview component
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between mb-4">
                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
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
                className={`w-full flex-1 bg-white print:p-0 ${!isPreviewReady ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'
                    }`}
            />
        </div>
    );
};

export default Preview;