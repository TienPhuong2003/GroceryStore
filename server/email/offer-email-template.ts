// src/emails/monthlyDeals.template.ts

interface UserInfo {
  name: string;
}
function buildProductRows(deals: DealProduct[]) {
  const rows = [];

  for (let i = 0; i < deals.length; i += 3) {
    rows.push(deals.slice(i, i + 3));
  }

  return rows
    .map(
      (row) => `
      <tr>
        ${row
          .map(
            (p) => `
              <td style="width:33%;padding:8px;vertical-align:top;">
                <div
                  style="
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                    overflow:hidden;
                    text-align:center;
                  "
                >
                  ${
                    p.image
                      ? `
                        <img
                          src="${p.image}"
                          alt="${p.name}"
                          style="
                            width:100%;
                            height:100px;
                            object-fit:cover;
                          "
                        />
                      `
                      : ""
                  }

                  <div style="padding:10px;">
                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        font-weight:600;
                        color:#111827;
                      "
                    >
                      ${p.name}
                    </p>

                    <p
                      style="
                        margin:4px 0 0;
                        font-size:15px;
                        font-weight:700;
                        color:#16a34a;
                      "
                    >
                      $${p.price.toFixed(2)}

                      ${
                        p.originalPrice && p.originalPrice > p.price
                          ? `
                            <span
                              style="
                                font-size:11px;
                                color:#9ca3af;
                                text-decoration:line-through;
                                margin-left:4px;
                              "
                            >
                              $${p.originalPrice.toFixed(2)}
                            </span>
                          `
                          : ""
                      }
                    </p>
                  </div>
                </div>
              </td>
            `,
          )
          .join("")}
      </tr>
    `,
    )
    .join("");
}
interface DealProduct {
  name: string;
  image?: string | null;
  price: number;
  originalPrice?: number | null;
}

export const monthlyDealsTemplate = (user: UserInfo, deals: DealProduct[]) => {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">

      <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:24px 28px;">
        <h2 style="color:#fff;margin:0;font-size:20px;">
          Fresh Picks Just For You!
        </h2>

        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">
          Exclusive offers to kick off your month right
        </p>
      </div>

      <div style="padding:28px;">
        <p style="margin:0 0 20px;font-size:15px;color:#374151;">
          Hi <strong>${user.name}</strong>,
          check out this month's top picks!
        </p>

        <table width="100%" cellpadding="0" cellspacing="0">
          ${buildProductRows(deals)}
        </table>

        <div style="text-align:center;margin-top:24px;">
          <a
            href="${process.env.CLIENT_URL}/products"
            style="
              display:inline-block;
              background:#16a34a;
              color:#fff;
              padding:12px 32px;
              border-radius:12px;
              text-decoration:none;
              font-weight:600;
              font-size:14px;
            "
          >
            Shop All Deals →
          </a>
        </div>
      </div>

    </div>
  `;
};
