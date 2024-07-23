import ListProduct from "@/components/list-product";
import db from "@/lib/db";
import React from "react";

async function getProducts() {
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 10000);
  // });
  const products = db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
  });

  return products;
}

const Products = async () => {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-5 p-5">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
    </div>
  );
};

export default Products;
