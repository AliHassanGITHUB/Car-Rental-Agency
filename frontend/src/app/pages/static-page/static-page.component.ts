import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PageKey = 'about' | 'locations' | 'terms' | 'contact';

const pages: Record<PageKey, { eyebrow: string; title: string; body: string; points: string[] }> = {
  about: {
    eyebrow: 'About Aster Drive',
    title: 'Premium but approachable rental service.',
    body: 'Aster Drive is designed around clear handoffs, transparent pricing, and fast same-day reservations across airport and city branches.',
    points: ['Verified fleet inspections', 'Human support for modifications', 'Digital confirmation and invoice trail']
  },
  locations: {
    eyebrow: 'Branches',
    title: 'Airport, Downtown, and Marina pickup.',
    body: 'Branch management is backed by the API so inventory can be assigned, searched, and returned across locations.',
    points: ['Airport Terminal', 'Downtown Hub', 'Marina Branch']
  },
  terms: {
    eyebrow: 'Terms and policies',
    title: 'No hidden cancellation rules.',
    body: 'Free cancellation is available until 24 hours before pickup. Late returns, damage, and branch changes are handled according to the booking agreement shown before payment.',
    points: ['Minimum renter age: 21', 'Raw card data is never stored', 'License verification required before pickup']
  },
  contact: {
    eyebrow: 'Support',
    title: 'Get help before, during, or after a trip.',
    body: 'Support can assist with password reset, booking modifications, location changes, payment questions, and post-trip invoice requests.',
    points: ['support@asterdrive.test', '+1 555 0142', '24/7 airport handoff support']
  }
};

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './static-page.component.html',
  styleUrl: './static-page.component.scss'
})
export class StaticPageComponent {
  page = pages.about;

  constructor(private readonly route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      this.page = pages[(data['page'] as PageKey) ?? 'about'];
    });
  }
}
