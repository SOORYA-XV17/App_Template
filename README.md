# Angular 20 Professional Dashboard Template

A modern, responsive Angular 20 dashboard template designed for industrial and enterprise applications with professional UI/UX and comprehensive features.

## 🚀 Features

### ✨ Professional Design
- **Modern UI/UX** with industrial design principles
- **Hyundai Branding** integration with professional logos
- **Consistent Color Scheme** using `#0d2a66` navbar color
- **Responsive Layout** optimized for desktop and mobile
- **Material Icons** throughout the application

### 🔐 Security & Authentication
- **Hybrid Encryption** with RSA + AES encryption
- **JWT Authentication** with secure token management
- **Role-based Access Control** (RBAC)
- **Auth Guards** for route protection
- **Secure API Communication** with interceptors

### 📊 Dashboard Features
- **Dynamic Statistics** from backend APIs
- **Real-time Activity Feed** with live updates
- **Interactive Charts** and data visualization
- **Quick Actions** and navigation shortcuts
- **User Profile Management** with avatar support

### 🗂️ Management Modules
- **User Management** with sub-dashboard
- **Role Management** with permissions
- **Menu Management** with dynamic navigation
- **Code Management** with location hierarchies
- **Reports** with export functionality

### 🎨 UI Components
- **Professional Sidebar** with hover effects and animations
- **Responsive Navbar** with user dropdown
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Modal Dialogs** for forms and confirmations

### 📱 Mobile Responsive
- **Mobile-First Design** with proper z-index layering
- **Touch-Friendly** navigation and interactions
- **Optimized Layouts** for portrait and landscape modes
- **Mobile Sidebar** with backdrop overlay

## 🛠️ Technology Stack

- **Angular 20** - Latest Angular framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Material Icons** - Google Material Design icons
- **RxJS** - Reactive programming
- **FormBuilder** - Reactive forms
- **HttpClient** - API communication

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── toast/          # Toast notification component
│   │   └── hybrid-encryption-test/
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Main dashboard
│   │   ├── code-management/ # Location management
│   │   ├── menu-management/ # Menu administration
│   │   ├── profile/        # User profile
│   │   ├── reports/        # Reports and analytics
│   │   ├── roles/          # Role management
│   │   ├── settings/       # Application settings
│   │   └── users/          # User management
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── user.service.ts
│   │   ├── menu.service.ts
│   │   ├── code.service.ts
│   │   ├── product.service.ts
│   │   └── hybrid-encryption.service.ts
│   ├── shared/             # Shared components
│   │   ├── layout/         # Layout components
│   │   └── sidebar/        # Navigation sidebar
│   ├── guards/             # Route guards
│   └── interceptors/       # HTTP interceptors
├── assets/                 # Static assets
├── environments/           # Environment configurations
└── styles.css             # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS version)
- Angular CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SOORYA-XV17/App_Template.git
   cd App_Template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ng serve
   ```

4. **Open in browser**
   ```
   http://localhost:4200
   ```

## 🔧 Configuration

### Backend Integration
The application is configured to work with a backend API. Update the base URLs in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

### API Endpoints
The application expects the following API endpoints:
- `/api/jquery/dashboard/stats` - Dashboard statistics
- `/api/jquery/dashboard/activities` - Recent activities
- `/api/jquery/products/*` - Product management
- `/api/jquery/codes/*` - Location management
- `/api/jquery/menus/*` - Menu management
- `/api/jquery/auth/*` - Authentication

## 🎨 Design System

### Colors
- **Primary**: `#0d2a66` (Navbar and brand color)
- **Secondary**: Complementary colors for different sections
- **Success**: Green tones for positive actions
- **Warning**: Amber tones for alerts
- **Error**: Red tones for errors

### Typography
- **Primary Font**: Inter (web-safe fallback)
- **Sidebar Font**: Outfit (professional appearance)
- **Icon Font**: Material Icons

### Components
All components follow consistent design patterns:
- Rounded corners (`rounded-xl`)
- Subtle shadows (`shadow-sm`)
- Hover effects and transitions
- Proper spacing and padding

## 📱 Mobile Optimization

The application is fully responsive with:
- **Mobile Sidebar**: Overlay with backdrop
- **Proper Z-Index**: Sidebar above navbar in mobile
- **Touch Navigation**: Optimized for mobile interaction
- **Responsive Grids**: Adaptive layouts for different screen sizes

## 🔐 Security Features

- **Hybrid Encryption**: RSA + AES for secure data transmission
- **JWT Tokens**: Secure authentication with automatic refresh
- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Frontend and backend validation
- **XSS Protection**: Sanitized data handling

## 🚀 Deployment

### Development
```bash
ng serve --host 0.0.0.0 --port 4200
```

### Production Build
```bash
ng build --prod
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ng build --prod
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]
```

## 🧪 Testing

### Unit Tests
```bash
ng test
```

### E2E Tests
```bash
ng e2e
```

### Linting
```bash
ng lint
```

## 📈 Performance

- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Strategy**: Optimized change detection
- **TrackBy Functions**: Efficient list rendering
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Optimal bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**SOORYA-XV17**
- GitHub: [@SOORYA-XV17](https://github.com/SOORYA-XV17)
- Repository: [App_Template](https://github.com/SOORYA-XV17/App_Template)

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Tailwind CSS for the utility-first approach
- Material Design for the icon library
- Hyundai for design inspiration

---

⭐ **Star this repository if you find it helpful!**
