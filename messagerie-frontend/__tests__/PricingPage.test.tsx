import { render, screen } from '@testing-library/react';
import PricingPage from '../src/app/offre/page';
import expect from "expect";
import {describe, it} from "node:test"; // Chemin relatif vers ton fichier

describe('PricingPage', () => {
    it('affiche le titre "Découvrez nos offres"', () => {
        render(<PricingPage />);
        expect(screen.getByText(/découvrez nos offres/i)).toBeInTheDocument();
    });
});