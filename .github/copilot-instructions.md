# Copilot Instructions for ECommerce Django Project

## Architecture Overview

This is a Django 3.0.5 e-commerce platform with a **dual-role authentication system**: Admin users manage products/orders, Customer users browse and purchase items. The app uses Django's built-in `User` and `Group` models for authorization.

### Core Components

- **`ecom/models.py`**: Four main models:
  - `Customer`: Extended user profile with address, mobile, profile picture (one-to-one with User)
  - `Product`: Basic product catalog (name, price, description, image)
  - `Orders`: Order records with status states (Pending → Order Confirmed → Out for Delivery → Delivered)
  - `Feedback`: Public feedback/reviews (unconstrained, no product link)

- **`ecom/views.py`**: 40+ view functions handling routing. Key patterns:
  - Admin views protected with `@login_required` + `user_passes_test` checks
  - Customer views check `is_customer()` helper to verify group membership
  - Shared `afterlogin_view` redirects authenticated users to dashboard or home

- **Cart System**: Cookie-based (not database-backed). Products stored as pipe-delimited IDs in `product_ids` cookie. Cart persists across sessions but uses client-side storage.

- **Payment Flow**: Checkout collects email/mobile/address in cookies → renders payment page → `payment_success_view` converts cookies to Order records and clears cookies.

- **Invoice Generation**: Uses `xhtml2pdf` library to render download_invoice.html template as PDF (`render_to_pdf` utility function).

## Key Workflows

### Running the Application
```bash
# Activate virtual environment (Windows)
.\env\Scripts\activate

# Run migrations
python manage.py migrate

# Start dev server
python manage.py runserver
```

### User Authentication Flow
1. **New Customer**: Signup creates User + Customer profile, adds to "CUSTOMER" group
2. **New Admin**: Use Django admin panel (`/admin/`) - set `is_staff=True`, add to admin group manually
3. **Login Redirect**: `afterlogin_view` checks group membership; customers go to `/customer-home`, admins to `/admin-dashboard`

### Database Schema Patterns
- **Cascading Deletes**: Customer and Orders models use `on_delete=models.CASCADE` on foreign keys; deleting a user deletes associated Customer profile
- **Image Uploads**: Store in `media/product_image/` and `media/profile_pics/`; use `ImageField.url` property to render in templates

## Project Conventions

### File Organization
- **Templates**: `templates/ecom/` organized by role (admin_*.html, customer_*.html, shared pages)
- **Static Files**: CSS/images in `static/` (images/, product_image/, profile_pic/)
- **Migrations**: Auto-generated; don't edit manually; use `makemigrations` → `migrate` cycle

### Email Configuration
Settings in `ecommerce/settings.py` uses Gmail SMTP. **Must configure before contact/email features work**:
```python
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'app-specific-password'  # Not regular Gmail password
EMAIL_RECEIVING_USER = ['target@example.com']
```
Requires Gmail "Less secure apps" enabled or app-specific password for 2FA accounts.

### Form Patterns
- **ModelForms**: Use Django's `ModelForm` for models; non-model forms (AddressForm, ContactusForm) inherit from `forms.Form`
- **Image Handling**: Pass `request.FILES` to form for profile_pic and product_image uploads
- **Validation**: Standard Django validation; forms.is_valid() checks both field-level and cross-field rules

### Decorators & Guards
- Admin views: `@login_required(login_url='adminlogin')` - no group check (assumes admin users manually set via /admin/)
- Customer views: `@login_required(login_url='customerlogin')` + `@user_passes_test(is_customer)` - enforces group membership
- `is_customer()` helper: Returns `user.groups.filter(name='CUSTOMER').exists()`

## Critical Technical Details

### Cart Logic (Non-Obvious)
- **Add to Cart**: Appends product ID to cookie string (pipe-delimited): `"1|3|5|3"` (duplicates allowed for quantity)
- **Cart Count**: `len(set(counter))` gives unique products, not total items
- **Remove**: Uses `set()` to deduplicate, removes one instance, rebuilds pipe-delimited string
- **Edge Case**: Empty cart clears `product_ids` cookie entirely; template must handle None

### Order Creation
- Orders created on `payment_success_view`, not checkout submission
- Status always starts as "Pending"
- `get_or_create()` prevents duplicate orders on page refresh
- Email/mobile/address stored in Order record, not fetched from Customer profile (allows address changes per order)

### URL Routing Quirk
- `path('orders/')` is a placeholder that currently shows empty template (`customer_orders` view)
- Admin/customer routes prefixed by role name but no URL namespace (avoid `{app_name}:view_name` references)

## Common Modifications

### Adding New Product Fields
1. Update `Product` model in `ecom/models.py`
2. Update `ProductForm` in `ecom/forms.py` (add to fields list)
3. Run: `python manage.py makemigrations` → `python manage.py migrate`
4. Update admin templates: `admin_add_products.html`, `admin_update_product.html`

### Adding Admin Permissions
- Django's built-in permission system not used; authorization via `is_staff` + group check
- To restrict admin action: Add `user_passes_test(lambda u: u.is_staff and is_admin(u))` decorator

### Modifying Order Status States
- Edit `STATUS` tuple in `Orders` model
- Run migrations
- Update `admin_view_booking.html` if displaying dropdown

## Dependencies & External Tools
- **xhtml2pdf**: PDF generation from HTML templates (requires reportlab)
- **django-widget-tweaks**: Template tag library for form rendering (`{% render_form_group %}`-style tags)
- **SQLite**: Default database; no external DB setup needed for development

## Testing Checklist (Not Automated)
- **Manual Testing**: No automated tests in codebase; test via browser
- Cart persistence across page reloads
- Admin/customer login role separation
- Invoice PDF generation
- Email sending (contact form)
- Image upload validation and storage
