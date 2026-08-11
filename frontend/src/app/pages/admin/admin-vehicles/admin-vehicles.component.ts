import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { BranchService } from '../../../services/branch.service';
import { Vehicle, Branch, PaginatedResponse } from '../../../models';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-vehicles">
      <div class="page-header">
        <div>
          <h1>Manage Vehicles</h1>
          <p>{{ totalVehicles() }} vehicles in fleet</p>
        </div>
        <button class="btn-primary" (click)="openAddForm()">+ Add Vehicle</button>
      </div>

      <!-- Add/Edit Form -->
      @if (showForm()) {
        <div class="form-panel">
          <div class="form-header">
            <h2>{{ editingVehicle() ? 'Edit Vehicle' : 'Add New Vehicle' }}</h2>
            <button class="btn-close" (click)="closeForm()">✕</button>
          </div>
          <form (ngSubmit)="saveVehicle()" class="vehicle-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Make *</label>
                <input type="text" [(ngModel)]="formData.make" name="make" required placeholder="e.g. Toyota" />
              </div>
              <div class="form-group">
                <label>Model *</label>
                <input type="text" [(ngModel)]="formData.model" name="model" required placeholder="e.g. Corolla" />
              </div>
              <div class="form-group">
                <label>Year *</label>
                <input type="number" [(ngModel)]="formData.year" name="year" required min="2000" max="2030" />
              </div>
              <div class="form-group">
                <label>Category *</label>
                <select [(ngModel)]="formData.category" name="category" required>
                  <option value="">Select Category</option>
                  <option value="economy">Economy</option>
                  <option value="compact">Compact</option>
                  <option value="midsize">Midsize</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div class="form-group">
                <label>Transmission *</label>
                <select [(ngModel)]="formData.transmission" name="transmission" required>
                  <option value="">Select Transmission</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div class="form-group">
                <label>Seats *</label>
                <input type="number" [(ngModel)]="formData.seats" name="seats" required min="2" max="15" />
              </div>
              <div class="form-group">
                <label>Daily Rate ($) *</label>
                <input type="number" [(ngModel)]="formData.daily_rate" name="daily_rate" required min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label>Branch *</label>
                <select [(ngModel)]="formData.branch_id" name="branch_id" required>
                  <option value="">Select Branch</option>
                  @for (branch of branches(); track branch.id) {
                    <option [value]="branch.id">{{ branch.name }} - {{ branch.city }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Color</label>
                <input type="text" [(ngModel)]="formData.color" name="color" placeholder="e.g. Red" />
              </div>
              <div class="form-group">
                <label>License Plate</label>
                <input type="text" [(ngModel)]="formData.license_plate" name="license_plate" placeholder="e.g. ABC-1234" />
              </div>
              <div class="form-group">
                <label>Mileage Included (km)</label>
                <input type="number" [(ngModel)]="formData.mileage_included" name="mileage_included" min="0" />
              </div>
              <div class="form-group full-width">
                <label>Description</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3" placeholder="Vehicle description..."></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : (editingVehicle() ? 'Update Vehicle' : 'Create Vehicle') }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Vehicles Table -->
      <div class="table-panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Year</th>
                <th>Category</th>
                <th>Daily Rate</th>
                <th>Status</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (vehicle of vehicles(); track vehicle.id) {
                <tr>
                  <td class="vehicle-cell">
                    <div class="vehicle-name">{{ vehicle.make }} {{ vehicle.model }}</div>
                    @if (vehicle.license_plate) {
                      <div class="plate-number">{{ vehicle.license_plate }}</div>
                    }
                  </td>
                  <td>{{ vehicle.year }}</td>
                  <td><span class="category-badge">{{ vehicle.category }}</span></td>
                  <td class="rate-cell">{{ formatCurrency(vehicle.daily_rate) }}/day</td>
                  <td>
                    <span class="status-badge" [class]="'status-' + vehicle.status">{{ vehicle.status }}</span>
                  </td>
                  <td>{{ vehicle.branch?.name ?? 'N/A' }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon edit" (click)="openEditForm(vehicle)" title="Edit">✏️</button>
                    <button class="btn-icon delete" (click)="confirmDelete(vehicle)" title="Delete">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">No vehicles found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">← Previous</button>
            <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">Next →</button>
          </div>
        }
      </div>

      <!-- Delete Confirmation -->
      @if (showDeleteConfirm()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Delete Vehicle</h3>
            <p>Are you sure you want to delete <strong>{{ deletingVehicle()?.make }} {{ deletingVehicle()?.model }}</strong>?</p>
            <p class="warning">This action cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="cancelDelete()">Cancel</button>
              <button class="btn-danger" (click)="deleteVehicle()" [disabled]="deleting()">
                {{ deleting() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .admin-vehicles {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 4px;
    }

    .page-header p { color: #666; }

    /* Buttons */
    .btn-primary {
      padding: 10px 24px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover { background: #c73a52; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }

    .btn-secondary {
      padding: 10px 24px;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-danger {
      padding: 10px 24px;
      background: #c62828;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-danger:disabled { background: #ccc; cursor: not-allowed; }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      color: #666;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-icon.edit:hover { background: #e3f2fd; }
    .btn-icon.delete:hover { background: #fce4ec; }

    /* Form Panel */
    .form-panel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
      overflow: hidden;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }

    .form-header h2 { font-size: 1.2rem; color: #1a1a2e; }

    .vehicle-form { padding: 24px; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }

    .form-group label {
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 14px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #0f3460;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    /* Table Panel */
    .table-panel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .table-container { overflow-x: auto; }

    table { width: 100%; border-collapse: collapse; }

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
      font-size: 0.9rem;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }

    .vehicle-cell .vehicle-name { font-weight: 600; color: #1a1a2e; }
    .vehicle-cell .plate-number { font-size: 0.8rem; color: #999; font-family: monospace; margin-top: 2px; }

    .category-badge {
      display: inline-block;
      padding: 3px 10px;
      background: #f0f0f0;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .rate-cell { font-weight: 600; color: #1a1a2e; }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-available { background: #e8f5e9; color: #2e7d32; }
    .status-rented { background: #fff3e0; color: #e65100; }
    .status-maintenance { background: #fce4ec; color: #c62828; }

    .actions-cell { white-space: nowrap; }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 20px;
      border-top: 1px solid #f0f0f0;
    }

    .page-btn {
      padding: 8px 16px;
      background: #f0f0f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .page-btn:hover:not(:disabled) { background: #e0e0e0; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .page-info { color: #666; font-size: 0.9rem; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }

    .modal {
      background: #fff;
      border-radius: 12px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
    }

    .modal h3 { margin-bottom: 12px; color: #1a1a2e; }
    .modal p { color: #555; margin-bottom: 8px; }
    .modal .warning { color: #c62828; font-size: 0.85rem; }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    /* Loading */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f0f0f0;
      border-top-color: #e94560;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminVehiclesComponent implements OnInit {
  vehicles = signal<Vehicle[]>([]);
  branches = signal<Branch[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingVehicle = signal<Vehicle | null>(null);
  showDeleteConfirm = signal(false);
  deletingVehicle = signal<Vehicle | null>(null);
  deleting = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalVehicles = signal(0);

  formData = {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    transmission: '',
    seats: 5,
    daily_rate: 0,
    branch_id: 0,
    color: '',
    license_plate: '',
    mileage_included: 300,
    description: ''
  };

  constructor(
    private adminService: AdminService,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadBranches();
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.adminService.getVehicles(this.currentPage()).subscribe({
      next: (res) => {
        this.vehicles.set(res.data);
        this.totalPages.set(res.last_page);
        this.totalVehicles.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadBranches(): void {
    this.branchService.getAll().subscribe({
      next: (branches) => this.branches.set(branches)
    });
  }

  openAddForm(): void {
    this.editingVehicle.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  openEditForm(vehicle: Vehicle): void {
    this.editingVehicle.set(vehicle);
    this.formData = {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      category: vehicle.category,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      daily_rate: vehicle.daily_rate,
      branch_id: vehicle.branch_id,
      color: vehicle.color ?? '',
      license_plate: vehicle.license_plate ?? '',
      mileage_included: vehicle.mileage_included,
      description: vehicle.description ?? ''
    };
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingVehicle.set(null);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      category: '',
      transmission: '',
      seats: 5,
      daily_rate: 0,
      branch_id: 0,
      color: '',
      license_plate: '',
      mileage_included: 300,
      description: ''
    };
  }

  saveVehicle(): void {
    this.saving.set(true);
    const data = { ...this.formData } as Partial<Vehicle>;

    const request = this.editingVehicle()
      ? this.adminService.updateVehicle(this.editingVehicle()!.id, data)
      : this.adminService.createVehicle(data);

    request.subscribe({
      next: () => {
        this.closeForm();
        this.loadVehicles();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  confirmDelete(vehicle: Vehicle): void {
    this.deletingVehicle.set(vehicle);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.deletingVehicle.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteVehicle(): void {
    const vehicle = this.deletingVehicle();
    if (!vehicle) return;

    this.deleting.set(true);
    this.adminService.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.cancelDelete();
        this.loadVehicles();
        this.deleting.set(false);
      },
      error: () => this.deleting.set(false)
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadVehicles();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}
