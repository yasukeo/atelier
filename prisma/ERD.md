# Data Model ERD (Textual)

Entities:
- User (id, email [unique], passwordHash, name?, role, createdAt, updatedAt)
- Artist (id, name, bio?, createdAt, updatedAt)
- Style (id, name [unique], createdAt, updatedAt)
- Technique (id, name [unique], createdAt, updatedAt)
- Painting (id, title, description?, kind [UNIQUE|RECREATABLE], priceMAD, widthCm, heightCm, orientation [PORTRAIT|PAYSAGE|CARRE|AUTRE], colorTags[], available, leadTimeWeeks?, artistId, styleId?, techniqueId?, createdAt, updatedAt)
- PaintingImage (id, paintingId, url, alt?, position)
- PaintingRecreationOption (id, paintingId, widthCm, heightCm, priceMAD)
- DiscountCode (id, code [unique], percent, startsAt?, endsAt?, createdAt, updatedAt)
- Order (id, customerId, status, totalMAD, shippingFeeMAD, discountCodeId?, phone, postalCode, addressLine1, addressLine2?, city, country, createdAt, updatedAt)
- OrderItem (id, orderId, paintingId, widthCm, heightCm, unitPriceMAD, quantity)
- OrderStatusHistory (id, orderId, status, note?, createdAt)
- CartItem (id, userId?, sessionId?, paintingId, widthCm?, heightCm?, unitPriceMAD, quantity, createdAt)

Relationships:
- User 1—n Order
- User 1—n CartItem
- Artist 1—n Painting
- Style 1—n Painting
- Technique 1—n Painting
- Painting 1—n PaintingImage
- Painting 1—n PaintingRecreationOption
- Painting 1—n OrderItem
- Painting 1—n CartItem
- DiscountCode 1—n Order
- Order 1—n OrderItem
- Order 1—n OrderStatusHistory

Indexes:
- Painting: (createdAt, id), priceMAD
- PaintingRecreationOption: unique (paintingId, widthCm, heightCm)
- CartItem: indexes on (userId), (sessionId)
