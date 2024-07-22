import React from "react";

async function getProducts() {
  await new Promise((resolve) => {
    setTimeout(resolve, 10000);
  });
}

const Products = async () => {
  const products = await getProducts();
  return <div></div>;
};

export default Products;
