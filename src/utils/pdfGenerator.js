import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDimension } from './stairMath';

export const generatePDF = async (results, includeBlueprint = false) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.text("Dundas Specialties", pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Stair Stringer Cut List", pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(0);
    doc.setFontSize(12);

    let y = 50;
    const lineHeight = 10;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");

    const addLine = (label, value) => {
        doc.text(`${label}:`, 20, y);
        doc.text(value, 120, y);
        y += lineHeight;
    };

    addLine("Total Rise", `${results.totalRise}"`);
    addLine("Total Run", `${results.totalRun}"`);
    addLine("Target Rise", `${results.targetStepRise}"`);
    addLine("Target Run", `${results.targetStepRun}"`);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.text("Cut Details", 20, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");

    addLine("Number of Steps", `${results.numberOfSteps}`);
    addLine("Rise per Step", `${formatDimension(results.risePerStep)} (${results.risePerStep.toFixed(3)}")`);
    addLine("Run per Step", `${formatDimension(results.runPerStep)} (${results.runPerStep.toFixed(3)}")`);
    addLine("Stringer Length", `${formatDimension(results.stringerLength)} (Approx)`);
    addLine("Cut Angle", `${results.angleDegrees.toFixed(2)}°`);

    y += 10;

    // Speed Square Guide
    doc.setFont("helvetica", "bold");
    doc.text("Speed Square Alignment", 20, y);
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`Rise Setting (Tongue): ${results.risePerStep.toFixed(3)}"`, 20, y);
    y += lineHeight;
    doc.text(`Run Setting (Body): ${results.runPerStep.toFixed(3)}"`, 20, y);

    // Footer
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on ${date}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    // Blueprint
    if (includeBlueprint) {
        const blueprintElement = document.querySelector('.stair-svg');
        if (blueprintElement) {
             try {
                // We need to capture the SVG. html2canvas works best if we wrap it or capture the container
                // But the container has other stuff. Let's capture the SVG itself.
                // Note: html2canvas has issues with raw SVGs sometimes.
                // Alternative: Convert SVG to canvas manually or use html2canvas on the parent div

                // Add a new page for the blueprint
                doc.addPage();
                doc.setFontSize(16);
                doc.text("Stringer Blueprint", pageWidth / 2, 20, { align: 'center' });

                const canvas = await html2canvas(blueprintElement.parentElement, {
                    scale: 2, // higher resolution
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgProps = doc.getImageProperties(imgData);
                const pdfWidth = doc.internal.pageSize.getWidth() - 40;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                doc.addImage(imgData, 'PNG', 20, 30, pdfWidth, pdfHeight);
             } catch (e) {
                 console.error("Failed to capture blueprint", e);
             }
        }
    }

    // Save
    doc.save("stair-cut-list.pdf");
};
