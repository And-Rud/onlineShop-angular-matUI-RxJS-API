import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { IProducts } from 'src/app/models/products';
import { ProductsService } from 'src/app/services/products.service';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  constructor(
    private ProductsService: ProductsService,
    public dialog: MatDialog
  ) {}

  products: IProducts[];
  productsSubscription: Subscription;
  basket: IProducts[];
  basketSubscription: Subscription;
  canEdit: boolean = false;
  canView: boolean = false;

  ngOnInit(): void {
    this.canEdit = true;
    this.productsSubscription = this.ProductsService.getProducts().subscribe(
      (data) => {
        this.products = data;
      }
    );
    this.basketSubscription =
      this.ProductsService.getProductFromBasket().subscribe((data) => {
        this.basket = data;
      });
  }

  //підготовка даних
  addToBasket(product: IProducts) {
    product.quantity = 1;
    let findItem;
    if (this.basket.length > 0) {
      findItem = this.basket.find((item) => item.id === product.id);
      if (findItem) this.updateToBasket(findItem);
      else this.postToBasket(product);
    } else {
      this.postToBasket(product);
    }
  }

  //публікування в кошик
  postToBasket(product: IProducts) {
    this.ProductsService.postProductToBasket(product).subscribe((data) =>
      this.basket.push(data)
    );
  }

  //оновлення кошика
  updateToBasket(product: IProducts) {
    product.quantity += 1;
    this.ProductsService.updateProductToBasket(product).subscribe((data) => {
      //якби в кошику був +/- товарів то тут була б логіка
    });
  }

  ngOnDestroy() {
    if (this.productsSubscription) this.productsSubscription.unsubscribe();
    if (this.basketSubscription) this.basketSubscription.unsubscribe();
  }

  deleteItem(id: number) {
    //subscribe - ми підписуємосб на цю подію
    this.ProductsService.deleteProduct(id).subscribe(() =>
      this.products.find((item) => {
        if (id === item.id) {
          let idx = this.products.findIndex((data) => data.id === id);
          this.products.splice(idx, 1);
        }
      })
    );
  }

  openDialog(product?: IProducts): void {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.disableClose = true;
    dialogConfig.data = product;
    const dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);
    //після submit перед закриттям данні перехватяться і відправляться в функції postData
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        //якщо є дані і є id
        if (data && data.id) {
          this.updateData(data);
        } else {
          this.postData(data);
        }
      }
    });
  }

  //Функція звернеться до сервіса postProduct, передасть дані та додасть їх в локальний масив
  postData(data: IProducts) {
    console.log(data);
    this.ProductsService.postProduct(data).subscribe((data) =>
      this.products.push(data)
    );
  }

  updateData(product: IProducts) {
    this.ProductsService.updateProduct(product).subscribe((data) => {
      this.products = this.products.map((product) => {
        if (product.id === data.id) return data;
        else return product;
      });
    });
  }
}
