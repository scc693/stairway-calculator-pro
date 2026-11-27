import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { generatePDF } from './utils/pdfGenerator';

vi.mock('./components/Blueprint', () => ({ default: () => null }));
vi.mock('./components/InstallPrompt', () => ({ default: () => null }));
vi.mock('./utils/pdfGenerator', () => ({ generatePDF: vi.fn() }));

describe('cut list export', () => {
  it('exports the calculated run when the total run field is blank', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Total Rise/), { target: { value: '108' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    await waitFor(() => expect(generatePDF).toHaveBeenCalledWith(
      expect.objectContaining({
        inputs: expect.objectContaining({ totalRun: 0 }),
        results: expect.objectContaining({ totalRun: 130 })
      }),
      true
    ));
  });

  it('removes the previous cut list when the new layout is invalid', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Total Rise/), { target: { value: '108' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Total Run/), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByRole('alert')).toHaveTextContent('No layout');
    expect(screen.queryByRole('button', { name: 'Download PDF' })).not.toBeInTheDocument();
  });
});
