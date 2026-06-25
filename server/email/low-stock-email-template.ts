
interface LowStockProduct {
  name: string;
  image?: string | null;
  category: string;
  unit?: string | null;
  stock: number | null;
}

export const lowStockTemplate = (
  product: LowStockProduct
) => {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:24px 28px;">
        <h2 style="color:#fff;margin:0;">Low Stock Alert</h2>
      </div>

      <div style="padding:28px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
          ${
            product.image
              ? `<img src="${product.image}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;" />`
              : ""
          }

          <div>
            <h3>${product.name}</h3>
            <p>${product.category} • ${product.unit}</p>
          </div>
        </div>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;text-align:center;">
          <p>CURRENT STOCK</p>
          <p style="font-size:32px;color:#dc2626;">
            ${product.stock}
          </p>
        </div>
      </div>
    </div>
  `;
};