import React, { useState } from "react";
import { DARK } from "../../constants";
import { BusinessModeCard } from "./BusinessModeCard";
import { ClothingFieldsPanel } from "./ClothingFieldsPanel";
import { ProductsSection } from "./SetupTab";

export function ProductsTab({ user, business, setGlobalProducts }) {
  const [products, setProducts] = useState([]);

  function handleProductsChange(nextProducts) {
    setProducts(nextProducts || []);
    if (setGlobalProducts) setGlobalProducts(nextProducts || []);
  }

  function handleAddClothingItem() {
    alert("Use the + Add product button below. Add the item first, then complete size, colour, brand, condition and status in Clothing details.");
  }

  return (
    <div>
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>Products / Services</h2>
        <p style={{ fontSize:"13px", color:"#888" }}>Manage what your business sells. These items appear on your public page.</p>
      </div>
      <BusinessModeCard business={business} products={products} onAddClothingItem={handleAddClothingItem} />
      <ClothingFieldsPanel products={products} onProductsChange={handleProductsChange} />
      <ProductsSection businessId={business?.id} prefilledProducts={null} onProductsPrefilled={() => {}} onProductsChange={handleProductsChange} userId={user.id} businessCategory={business?.category} />
    </div>
  );
}
