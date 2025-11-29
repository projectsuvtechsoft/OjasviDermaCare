import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/Service/cart.service';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { Renderer2 } from '@angular/core';
import { ProductDataService } from 'src/app/Service/ProductData.service ';

// Simple DOM event stub for click handlers
function createEventStub() {
  return {
    preventDefault: jasmine.createSpy('preventDefault'),
    stopPropagation: jasmine.createSpy('stopPropagation'),
    target: { checked: true, value: '' },
  } as any;
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  // Spies
  let apiSpy: jasmine.SpyObj<ApiServiceService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let cookieSpy: jasmine.SpyObj<CookieService>;
  let productDataSpy: jasmine.SpyObj<ProductDataService>;
  let renderer2Mock: Partial<Renderer2>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj<ApiServiceService>('ApiServiceService', [
      'getAllCategoryMaster',
      'getAllIngredientMaster',
      'getAllProductMaster',
      'getFavoriteProducts',
      'SubsribeToNewsLetterCreate',
      'sessionKeyGet',
      'removeFavoriteProduct',
      'addFavoriteProduct',
    ]);

    toastrSpy = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
      'warning',
      'info',
      'show',
    ]);

    cartServiceSpy = jasmine.createSpyObj<CartService>('CartService', [
      'addToCart',
      'removeFromCart',
    ], {
      // cartCount$ could be used by other components; not needed here
    } as any);

    cookieSpy = jasmine.createSpyObj<CookieService>('CookieService', ['get']);
    cookieSpy.get.and.returnValue('device-1');

    productDataSpy = jasmine.createSpyObj<ProductDataService>('ProductDataService', ['setProduct']);

    renderer2Mock = {
      removeClass: () => {},
    } as Partial<Renderer2>;

    // Default API spies
    apiSpy.getAllCategoryMaster.and.returnValue(of({ data: [] }));
    apiSpy.getAllIngredientMaster.and.returnValue(of({ data: [] }));
    apiSpy.getAllProductMaster.and.returnValue(of({ data: [], count: 0 }));
    apiSpy.getFavoriteProducts.and.returnValue(of({ code: 200, count: 0, data: [] }));
    apiSpy.SubsribeToNewsLetterCreate.and.returnValue(of({ code: 200 } as any));
    apiSpy.sessionKeyGet.and.returnValue(of({ sessionKey: 'abc' } as any));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent],
      providers: [
        { provide: ApiServiceService, useValue: apiSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CartService, useValue: cartServiceSpy },
        DatePipe,
        { provide: CookieService, useValue: cookieSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_: string) => null } } },
        },
        { provide: Renderer2, useValue: renderer2Mock },
        { provide: ProductDataService, useValue: productDataSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Ensure clean session state for each test
    sessionStorage.clear();
    localStorage.clear();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSearch should filter products by name, description, and category', () => {
    component.allProducts = [
      { ID: 1, NAME: 'Alpha Cream', DESCRIPTION: 'Hydrating', CATEGORY_NAME: 'Skincare' },
      { ID: 2, NAME: 'Beta Serum', DESCRIPTION: 'Brightening', CATEGORY_NAME: 'Serum' },
      { ID: 3, NAME: 'Gamma Oil', DESCRIPTION: 'Moisturizer', CATEGORY_NAME: 'Skincare' },
    ];
    // Search by name
    component.searchText = 'beta';
    component.onSearch();
    expect(component.products.map(p => p.ID)).toEqual([2]);

    // Search by description
    component.searchText = 'hydrating';
    component.onSearch();
    expect(component.products.map(p => p.ID)).toEqual([1]);

    // Search by category
    component.searchText = 'skincare';
    component.onSearch();
    expect(component.products.map(p => p.ID)).toEqual([1, 3]);

    // Empty search resets list
    component.searchText = '  ';
    component.onSearch();
    expect(component.products).toEqual(component.allProducts);
  });

  it('onSortChange should set default sort and fetch products when value is default', () => {
    const spyGetProducts = spyOn(component, 'getProducts');
    const event = { target: { value: 'default' } } as unknown as Event;

    component.onSortChange(event);

    expect(component.sortKey).toBe('ID');
    expect(component.sortDirection).toBe('desc');
    expect(spyGetProducts).toHaveBeenCalled();
  });

  it('onSortChange should set custom sort and fetch products', () => {
    const spyGetProducts = spyOn(component, 'getProducts');
    const event = { target: { value: 'RATE:asc' } } as unknown as Event;

    component.onSortChange(event);

    expect(component.sortKey).toBe("JSON_EXTRACT(VARIENTS, '$[0].RATE')");
    expect(component.sortDirection).toBe('asc');
    expect(spyGetProducts).toHaveBeenCalled();
  });

  it('setCurrentPage should respect bounds and call getProducts only for valid pages', () => {
    // 42 products, 9 per page -> totalPages = 5
    component.totalProducts = 42;
    component.productsPerPage = 9;

    const spyGetProducts = spyOn(component, 'getProducts');

    component.setCurrentPage(0); // out of lower bound
    expect(spyGetProducts).not.toHaveBeenCalled();

    component.setCurrentPage(6); // out of upper bound (> 5)
    expect(spyGetProducts).not.toHaveBeenCalled();

    component.setCurrentPage(3); // valid
    expect(component.currentPage).toBe(3);
    expect(spyGetProducts).toHaveBeenCalled();
  });

  it('getStarIcons should return correct star HTML for rating values', () => {
    const html = component.getStarIcons(3.5);
    // 3 full stars, 1 half star, rest empty
    expect((html.match(/ri-star-fill/g) || []).length).toBe(3);
    expect((html.match(/ri-star-half-fill/g) || []).length).toBe(1);
    expect((html.match(/ri-star-line/g) || []).length).toBe(1);
  });

  it('isFilterApplied should reflect active filters', () => {
    // Initially false
    expect(component.isFilterApplied()).toBeFalse();

    // With category
    component.selectedCategories = [{ CATEGORY_ID: 1 }];
    expect(component.isFilterApplied()).toBeTrue();

    // Reset and check price slider
    component.selectedCategories = [];
    component.priceRange = 10;
    expect(component.isFilterApplied()).toBeTrue();

    // Reset and check discounts
    component.priceRange = 0;
    component.selectedDiscounts = [20];
    expect(component.isFilterApplied()).toBeTrue();

    // Reset and check range sliders
    component.selectedDiscounts = [];
    component.minRange = 5; component.maxRange = 40;
    expect(component.isFilterApplied()).toBeTrue();

    // Reset to defaults
    component.minRange = 0; component.maxRange = 40;
    expect(component.isFilterApplied()).toBeFalse();
  });

  it('loadProductVariantsFromData should populate variant maps and set stock', () => {
    const product = {
      ID: 101,
      VARIENTS: JSON.stringify([
        { VARIENT_ID: 201, RATE: 99, OPENING_STOCK: 10, CURRENT_STOCK: 7, UNIT_ID: 1, STATUS: 1 },
        { VARIENT_ID: 202, RATE: 149, OPENING_STOCK: 5, CURRENT_STOCK: 2, UNIT_ID: 2, STATUS: 1 },
      ]),
    } as any;

    // Ensure component.products contains the product to update CURRENT_STOCK_VARIENT
    component.products = [product];

    component.loadProductVariantsFromData(product);

    // First variant is selected by default
    expect(component.variantMap[101].length).toBe(2);
    expect(component.selectedVariantMap[101]).toBe(201);
    expect(component.variantRateMap[101]).toBe(99);
    expect(component.variantStockMap[101]).toBe(10);
    expect(component.unitIdMap[101]).toBe(1);

    const updated = component.products.find(p => p.ID === 101) as any;
    expect(updated.CURRENT_STOCK_VARIENT).toBe(7);
  });

  it('getImageArray should parse image URLs or fallback to empty array', () => {
    const productOk = { Images: JSON.stringify([{ PHOTO_URL: 'a.jpg' }, { PHOTO_URL: 'b.jpg' }]) } as any;
    const productBad = { Images: 'not-json' } as any;

    expect(component.getImageArray(productOk)).toEqual(['a.jpg', 'b.jpg']);
    expect(component.getImageArray(productBad)).toEqual([]);
  });

  it('toggleLike should show login modal when user is guest or not logged in', () => {
    // Guest user scenario
    sessionStorage.setItem('IS_GUEST', 'true');
    sessionStorage.removeItem('userId');

    const showSpy = spyOn(component, 'showLoginModal');
    const ev = createEventStub();

    component.toggleLike({ ID: 1, isLiked: false }, ev);

    expect(showSpy).toHaveBeenCalled();
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(ev.stopPropagation).toHaveBeenCalled();
  });

  it('onPriceChange should create rangeQuery and fetch products when priceRange > 0', () => {
    const spyGetProducts = spyOn(component, 'getProducts');

    component.priceRange = 25;
    component.onPriceChange();

    expect(component.rangeQuery).toContain("<= 25");
    expect(spyGetProducts).toHaveBeenCalled();

    // Reset
    component.priceRange = 0;
    component.onPriceChange();
    expect(component.rangeQuery).toBe('');
  });

  it('clearFilters should reset filter state and fetch products', () => {
    const spyGetProducts = spyOn(component, 'getProducts');

    component.selectedCategories = [{ CATEGORY_ID: 1 } as any];
    component.selectedIngredient = [{ ID: 1 } as any];
    component.selectedDiscounts = [10];
    component.minRange = 10;
    component.maxRange = 20;
    component.priceRange = 15;
    component.rangeQuery = 'something';

    component.clearFilters();

    expect(component.selectedCategories).toEqual([]);
    expect(component.selectedIngredient).toEqual([]);
    expect(component.selectedDiscounts).toEqual([]);
    expect(component.minRange).toBe(0);
    expect(component.maxRange).toBe(40);
    expect(component.priceRange).toBe(0);
    expect(component.rangeQuery).toBe('');
    expect(spyGetProducts).toHaveBeenCalled();
  });
});
