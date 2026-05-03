import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile';
import { AuthService } from '../../core/services/auth';
import { ProfileService } from '../../core/services/profile';
import { ToastService } from '../../core/services/toast';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: {
        nom: 'John',
        prenom: 'Doe',
        email: 'john@example.com',
        role: 'CUSTOMER'
      }
    });

    mockProfileService = jasmine.createSpyObj('ProfileService', [
      'getAddresses',
      'createAddress',
      'updateAddress',
      'deleteAddress',
      'setMainAddress'
    ]);

    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load addresses on init', () => {
    const mockAddresses = [
      { id: 1, rue: '123 Rue', ville: 'Paris', codePostal: '75001', pays: 'France', principal: true },
      { id: 2, rue: '456 Ave', ville: 'Lyon', codePostal: '69000', pays: 'France', principal: false }
    ];
    mockProfileService.getAddresses.and.returnValue(of(mockAddresses));

    component.ngOnInit();

    expect(mockProfileService.getAddresses).toHaveBeenCalled();
    expect(component.addresses.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should open add address modal', () => {
    component.openAddAddressModal();
    expect(component.showAddressModal).toBe(true);
    expect(component.editingAddressId).toBeNull();
  });

  it('should open edit address modal', () => {
    const address = { id: 1, rue: '123 Rue', ville: 'Paris', codePostal: '75001', pays: 'France', principal: true };
    component.openEditAddressModal(address);
    expect(component.showAddressModal).toBe(true);
    expect(component.editingAddressId).toBe(1);
  });

  it('should close address modal', () => {
    component.showAddressModal = true;
    component.closeAddressModal();
    expect(component.showAddressModal).toBe(false);
  });
});
