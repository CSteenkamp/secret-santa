# Secret Santa - Multi-Tenant Gift Exchange Platform

A web application for managing Secret Santa gift exchanges, live at https://secretsanta.wagnerway.co.za. Free for groups of up to 10 people; a one-time $10 Unlimited upgrade (Stripe) removes the limit for a group. Perfect for families, friend groups, and communities worldwide. Features multi-tenancy, unique login codes, wishlist management, and automated Secret Santa partner assignments.

## Features

- **Multi-Tenant**: Unlimited groups can use the same installation
- **Group Creation**: Anyone can create a new Secret Santa group
- **Invite Codes**: Share a 6-character code to invite people to your group
- **Admin Portal**: Manage participants, generate login codes, and create Secret Santa assignments
- **User Login**: Simple code-based authentication (no user accounts needed)
- **Wishlist Management**: Each person can add 1-5 gift items with links
- **Secret Santa Assignments**: Automated partner generation ensuring valid assignments
- **Mobile Responsive**: Works great on phones, tablets, and desktops
- **Data Isolation**: Each group's data is completely isolated from others

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Code-based (no user accounts)
- **Deployment**: Docker & Docker Compose

## Getting Started

### Prerequisites

**For Development:**
- Node.js 18+ installed
- PostgreSQL database OR Docker

**For Production (Easiest):**
- Docker and Docker Compose
- That's it!

### Quick Start with Docker (Recommended)

```bash
# 1. Start everything
docker-compose up -d

# 2. Access at http://localhost:3000
```

That's it! See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment.

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your database**

   Update `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/secret_santa?schema=public"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Admins

1. Go to `/admin` and login with your admin password
2. Add family members to the system (each gets a unique login code)
3. Share the login codes with each person
4. Once everyone has added their wishlist, click "Generate Assignments" to create Secret Santa pairs
5. View all assignments to verify everything worked

### For Participants

1. Go to `/login` and enter your unique login code
2. Add 3-5 items to your wishlist with links
3. Save your wishlist
4. View your Secret Santa assignment to see who you're buying for
5. Check their wishlist for gift ideas

## Database Schema

- **Person**: Stores participant information and login codes
- **WishlistItem**: Stores gift items for each person
- **Assignment**: Tracks who gives to whom each year
- **AdminConfig**: Stores admin password (hashed)

## Secret Santa Algorithm

The application uses a derangement algorithm to ensure:
- Everyone gives to exactly one person
- Everyone receives from exactly one person
- No one gives to themselves
- Minimum of 3 people required

## Development

### Project Structure

```
/app
  /admin          - Admin portal pages
  /api            - API routes
  /login          - User login page
  /wishlist       - User wishlist page
/lib              - Utilities and database client
/prisma           - Database schema
/components       - Reusable UI components (if needed)
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view/edit database

### Database Commands

- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma Client
- `npx prisma studio` - Open database GUI
- `npx prisma migrate reset` - Reset database (careful!)

## Deployment

### Environment Variables

Make sure to set these in your production environment:

```
DATABASE_URL=your-production-database-url
ADMIN_PASSWORD=your-secure-admin-password
```

### Build and Deploy

```bash
npm run build
npm start
```

Deploy to platforms like:
- Vercel (recommended for Next.js)
- Railway
- Heroku
- DigitalOcean App Platform

## Security Notes

- Admin password is hashed using bcrypt
- Login codes are randomly generated and unique
- No sensitive data is exposed to users
- Session data stored in browser sessionStorage (cleared on logout)

## Troubleshooting

### Database Connection Issues

Make sure your PostgreSQL server is running and the DATABASE_URL in `.env` is correct.

### Prisma Client Not Found

Run `npx prisma generate` to generate the Prisma Client.

### Port Already in Use

The app runs on port 3000 by default. Change it with:
```bash
npm run dev -- -p 3001
```

## Future Enhancements

Possible features to add:
- Email notifications when assignments are created
- Gift budget suggestions
- Mark gifts as purchased
- Historical assignments from previous years
- Family group management
- Image uploads for wishlist items

## License

This is a personal project for family use. Feel free to adapt it for your own needs!

## Support

For issues or questions, please check the code comments or create an issue in the repository.


## Payments (Unlimited upgrade)

- One-time $10 USD per group, sold through Stripe Checkout from the group admin dashboard.
- `POST /api/stripe/checkout` (admin session) creates the Checkout Session; Stripe redirects back to
  `/admin/dashboard?checkout=success&session_id=…`, where the dashboard calls `POST /api/stripe/confirm`.
  That endpoint re-reads the session from Stripe and upgrades the group only if it is paid and belongs to the admin's group.
- `POST /api/stripe/webhook` (`checkout.session.completed`, `checkout.session.async_payment_succeeded`) applies the same
  idempotent upgrade as a safety net.
- Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_UNLIMITED` (falls back to an inline $10 price).

## Legal pages

`/terms`, `/privacy`, `/refunds`. Operator, contact and governing law come from `LEGAL_OPERATOR`,
`LEGAL_CONTACT_EMAIL`, `LEGAL_JURISDICTION`. Review them before changing prices or what the app stores.

## Production deployment

Docker → GHCR (`.github/workflows/release.yml`) → Kubernetes (`deploy/k8s`, CloudNativePG + cloudflared).
Secrets are described in `deploy/k8s/base/secrets/README.md`. Roll out a new image with:

```bash
export KUBECONFIG=~/talos-install/cluster/kubeconfig-tailscale
kubectl apply -k deploy/k8s/overlays/shell-primary
kubectl -n secretsanta rollout restart deploy/secretsanta-web
```
