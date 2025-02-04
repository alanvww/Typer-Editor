"use client";

import { useEffect, useRef } from 'react';
import { Previewer } from 'pagedjs';
import './about.css';

// Define interface for flow return type
interface PageFlow {
    total: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages: any[];
}

export default function About() {
    // Use ref instead of boolean flag for initialization status
    const initializationRef = useRef(false);

    useEffect(() => {
        // Define preview function inside useEffect to avoid closure issues
        const startPreview = async () => {
            try {
                // Check if already initialized
                if (initializationRef.current) return;
                initializationRef.current = true;

                // Wait for DOM to be ready
                const domContent = document.querySelector('.App1111');
                if (!domContent) {
                    console.error('Could not find .App element');
                    return;
                }

                // Create a new previewer instance
                const paged = new Previewer();

                // Clone the DOM content to avoid modifications to original
                const contentToPreview = domContent.cloneNode(true).textContent;

                // Process the content
                const flow: PageFlow = await paged.preview(contentToPreview);
                console.log('Rendered', flow.total, 'pages.');
            } catch (error) {
                console.error('Error in PagedJS preview:', error);
            }
        };

        // Start the preview process
        startPreview();

        // Cleanup function
        return () => {
            initializationRef.current = false;
        };
    }, []); // Empty dependency array since we want this to run once

    return (
        <div className="App1111">
            <section className="chapter" id="about-page" data-reference="001">
                <h2 className="title" id="label-title">About</h2>
                <p className="text">Lorem ipsum dolor sit amet consectetur adipiscing elit. Duis nibh tortor</p>
            </section>
            <section className="chapter" id="chapter1-page" data-reference="002">
                <h2 className="title">Chapter 1</h2>
                <p className="text">Lorem ipsum dolor sit amet</p>
            </section>
            <section className="chapter" id="chapter2-page" data-reference="003">
                <h2 className="title">Chapter 2</h2>
                <p className="text">consectetur adipiscing elit</p>
            </section>
            <section className="chapter" id="chapter3-page" data-reference="004">
                <h2 className="title">Chapter 3</h2>
                <p className="text">Duis nibh tortor, pellentesque eu suscipit vel</p>
            </section>
        </div>
    );
}