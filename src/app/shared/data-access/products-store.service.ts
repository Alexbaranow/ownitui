import { Injectable, inject, signal } from '@angular/core';
import { ProductApiService } from './product-api.service';
import { Product } from './product.model';

/** Глобальный стор продуктов — загрузка один раз при первом обращении */
@Injectable({ providedIn: 'root' })
export class ProductsStoreService {
  private readonly productApi = inject(ProductApiService);
  private readonly loaded = signal(false);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Загружает продукты один раз; повторные вызовы игнорируются пока не будет reload */
  loadProducts(reload = false): void {
    if (this.loaded() && !reload) return;
    this.loaded.set(true);
    this.loading.set(true);
    this.error.set(null);
    this.productApi.getProducts(24).subscribe({
      next: ({ products }) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.loaded.set(false);
        this.error.set(err?.message ?? 'Не удалось загрузить товары');
        this.loading.set(false);
      },
    });
  }
}
