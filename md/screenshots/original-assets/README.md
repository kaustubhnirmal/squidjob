# Original High-Resolution Assets
# Logo and Banner Files for Migration Team

## Overview

This folder contains all original high-resolution logo files, hero banners, and branding assets used in the Tender Management System. These files are provided in their original quality for use in the migrated system.

## Logo Files

### 📎 **squidjob-logo-large.png**
- **Original Name**: SquidJob Logo_1749998000765.png
- **Type**: High-resolution company logo
- **Usage**: Main application branding, headers, documentation
- **Dimensions**: Full resolution PNG
- **Background**: Transparent
- **Format**: PNG with alpha channel

### 📎 **squidjob-logo-standard.png** 
- **Original Name**: SquidJob Logo_1749998301094.png
- **Type**: Standard resolution company logo
- **Usage**: Medium-sized branding elements, navigation
- **Dimensions**: Standard resolution PNG
- **Background**: Transparent
- **Format**: PNG with alpha channel

### 📎 **squidjob-logo-small.png**
- **Original Name**: SquidJob sml_1752393996294.png
- **Type**: Small/compact logo version
- **Usage**: PDF stamping, small UI elements, favicons
- **Dimensions**: Compact size optimized for small displays
- **Background**: Transparent
- **Format**: PNG with alpha channel
- **Note**: Currently used in PDF compilation service

### 📎 **application-logo.svg**
- **Original Name**: logo.svg
- **Type**: Vector application logo
- **Usage**: Scalable logo for web interface
- **Format**: SVG vector graphics
- **Background**: Transparent
- **Scalability**: Infinite resolution scaling

## Hero Banner Images

### 📎 **hero-banner-purple-squid.png**
- **Original Name**: 20250713_2339_Ecstatic Purple Squid Worker_simple_compose_01k02fjgb1endr95cehs51r857_1752432591996.png
- **Type**: Hero banner with purple theme
- **Usage**: Main landing page hero section
- **Theme**: Purple/violet color scheme
- **Content**: Artistic squid worker illustration
- **Dimensions**: High resolution for hero displays
- **Format**: PNG with transparent elements

### 📎 **hero-banner-squid-coffee.png**
- **Original Name**: 20250714_0005_Squid Cheers with Coffee_remix_01k02h11vaeb4bekrvg8jd9rbh_1752432026522.png
- **Type**: Alternative hero banner with coffee theme
- **Usage**: Secondary hero section or seasonal variations
- **Theme**: Warm colors with coffee elements
- **Content**: Celebratory squid with coffee illustration
- **Dimensions**: High resolution for hero displays
- **Format**: PNG with creative composition

## Usage Guidelines for Migration Team

### Logo Implementation
1. **Primary Logo**: Use `squidjob-logo-large.png` for main branding
2. **Navigation**: Use `squidjob-logo-standard.png` for navigation bars
3. **Small Elements**: Use `squidjob-logo-small.png` for compact spaces
4. **Web Scalable**: Use `application-logo.svg` for responsive web elements
5. **PDF Documents**: Use `squidjob-logo-small.png` for document stamping

### Hero Banner Implementation
1. **Main Hero**: Implement `hero-banner-purple-squid.png` as primary hero
2. **Alternative Hero**: Use `hero-banner-squid-coffee.png` for variations
3. **Responsive**: Ensure proper scaling on mobile devices
4. **Color Extraction**: Implement dynamic color theming from hero images
5. **Performance**: Optimize for web delivery while maintaining quality

### Brand Consistency
- Maintain aspect ratios when scaling logos
- Use transparent backgrounds for overlay scenarios
- Implement proper contrast for accessibility
- Follow brand color scheme from hero images
- Ensure logo visibility across all background colors

### File Formats and Quality
- **PNG Files**: Lossless compression, maintain transparency
- **SVG Files**: Vector format for infinite scalability
- **Web Optimization**: Compress for web delivery without quality loss
- **Print Quality**: Original files suitable for high-DPI displays

### Technical Implementation

#### CSS Implementation Example
```css
/* Logo in navigation */
.navbar-logo {
  background-image: url('original-assets/squidjob-logo-standard.png');
  background-size: contain;
  background-repeat: no-repeat;
  width: 150px;
  height: 40px;
}

/* Hero banner implementation */
.hero-banner {
  background-image: url('original-assets/hero-banner-purple-squid.png');
  background-size: cover;
  background-position: center;
  min-height: 60vh;
}

/* Responsive logo */
.responsive-logo {
  content: url('original-assets/application-logo.svg');
  max-width: 100%;
  height: auto;
}
```

#### HTML Implementation Example
```html
<!-- Main logo -->
<img src="original-assets/squidjob-logo-large.png" 
     alt="SquidJob Logo" 
     class="main-logo">

<!-- Hero section -->
<section class="hero-section" 
         style="background-image: url('original-assets/hero-banner-purple-squid.png')">
  <div class="hero-content">
    <!-- Hero content here -->
  </div>
</section>
```

### Color Palette from Assets

#### Primary Brand Colors (from logos)
- **Primary Purple**: #6B46C1 (extracted from logo)
- **Accent Blue**: #3B82F6 (complementary)
- **Dark Text**: #1F2937 (readability)
- **Light Background**: #F9FAFB (neutral)

#### Hero Banner Colors (from purple squid)
- **Hero Purple**: #8B5CF6 (dominant color)
- **Accent Purple**: #A855F7 (secondary)
- **Background Purple**: #EDE9FE (light variant)
- **Text Purple**: #5B21B6 (dark variant)

### Migration Checklist

#### Logo Implementation
- [ ] Replace all logo references with high-resolution versions
- [ ] Implement responsive logo scaling
- [ ] Add proper alt text for accessibility
- [ ] Optimize file sizes for web delivery
- [ ] Test logo visibility on all backgrounds

#### Hero Banner Implementation  
- [ ] Implement hero banner with proper scaling
- [ ] Add responsive breakpoints for mobile
- [ ] Implement color extraction for dynamic theming
- [ ] Add loading optimization for large images
- [ ] Test cross-browser compatibility

#### Brand Consistency
- [ ] Apply consistent color scheme throughout application
- [ ] Implement brand guidelines in CSS variables
- [ ] Ensure proper contrast ratios for accessibility
- [ ] Test logo legibility at various sizes
- [ ] Verify brand consistency across all pages

### File Specifications

| File | Type | Size | Usage | Quality |
|------|------|------|-------|---------|
| squidjob-logo-large.png | Logo | High-res | Main branding | Production |
| squidjob-logo-standard.png | Logo | Standard | Navigation | Production |
| squidjob-logo-small.png | Logo | Small | Compact elements | Production |
| application-logo.svg | Logo | Vector | Web responsive | Production |
| hero-banner-purple-squid.png | Banner | High-res | Hero section | Production |
| hero-banner-squid-coffee.png | Banner | High-res | Alternative hero | Production |

### Notes for Developers

1. **Performance**: Implement lazy loading for hero banners
2. **Accessibility**: Add proper alt text and ARIA labels
3. **Responsiveness**: Test on various screen sizes and orientations
4. **Browser Support**: Ensure compatibility across modern browsers
5. **SEO**: Optimize image metadata for search engines

### Copyright and Usage

- **Ownership**: All assets are proprietary to the organization
- **Usage Rights**: Licensed for use in this application and related materials
- **Modification**: May be resized and optimized for technical requirements
- **Distribution**: Included only for authorized migration and deployment

These original high-resolution assets ensure the migration team has access to all necessary branding materials for accurate system replication with proper visual identity maintenance.