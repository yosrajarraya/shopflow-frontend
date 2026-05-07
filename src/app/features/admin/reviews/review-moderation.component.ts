import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReviewService } from 'src/services/review.service';
import { ReviewResponse } from 'src/Models/review.model';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-review-moderation',
  templateUrl: './review-moderation.component.html',
  styleUrls: ['./review-moderation.component.css'],
  standalone: false
})
export class ReviewModerationComponent implements OnInit {
  allReviews: ReviewResponse[] = [];
  filtered: ReviewResponse[] = [];
  loading = true;
  filterStatus: 'ALL' | 'APPROVED' | 'PENDING' = 'ALL';
  searchQuery = '';
  currentPage = 1;
  pageSize = 8;

  constructor(
    private reviewService: ReviewService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadReviews(); }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.listerAvis().subscribe({
      next: reviews => { this.allReviews = reviews; this.applyFilters(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.allReviews.filter(r => {
      const matchSearch = !q || r.customerNom.toLowerCase().includes(q) || r.commentaire.toLowerCase().includes(q);
      const matchStatus = this.filterStatus === 'ALL' || (this.filterStatus === 'APPROVED' && r.approuve) || (this.filterStatus === 'PENDING' && !r.approuve);
      return matchSearch && matchStatus;
    });
    this.currentPage = 1;
  }

  approuver(r: ReviewResponse): void {
    this.reviewService.approuverAvis(r.id).subscribe({
      next: updated => {
        const idx = this.allReviews.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.allReviews[idx] = updated;
        this.applyFilters(); this.toastService.success('Avis approuvé.'); this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Erreur.')
    });
  }

  desapprouver(r: ReviewResponse): void {
    this.reviewService.desapprouverAvis(r.id).subscribe({
      next: updated => {
        const idx = this.allReviews.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.allReviews[idx] = updated;
        this.applyFilters(); this.toastService.success('Avis masqué.'); this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Erreur.')
    });
  }

  supprimer(r: ReviewResponse): void {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    this.reviewService.rejeterAvis(r.id).subscribe({
      next: () => { this.allReviews = this.allReviews.filter(x => x.id !== r.id); this.applyFilters(); this.toastService.success('Avis supprimé.'); this.cdr.detectChanges(); },
      error: () => this.toastService.error('Erreur lors de la suppression.')
    });
  }

  stars(n: number): number[] { return Array.from({ length: 5 }, (_, i) => i + 1); }

  totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  pages(): number[] { return Array.from({ length: this.totalPages() }, (_, i) => i + 1); }
  pagedReviews(): ReviewResponse[] { const s = (this.currentPage - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); }
  goPage(p: number): void { if (p >= 1 && p <= this.totalPages()) this.currentPage = p; }

  totalApproved(): number { return this.allReviews.filter(r => r.approuve).length; }
  totalPending(): number { return this.allReviews.filter(r => !r.approuve).length; }
}
