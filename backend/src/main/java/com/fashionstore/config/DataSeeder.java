package com.fashionstore.config;

import com.fashionstore.model.Category;
import com.fashionstore.model.Product;
import com.fashionstore.model.Role;
import com.fashionstore.model.User;
import com.fashionstore.repository.CategoryRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedData(UserRepository users, CategoryRepository categories,
                               ProductRepository products, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("admin@fashionstore.com")) {
                User admin = new User();
                admin.setName("Store Admin");
                admin.setUsername("admin@fashionstore.com");
                admin.setEmail("admin@fashionstore.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                users.save(admin);
            }

            // Retrieve or dynamically create categories to avoid NoSuchElementException
            Category men = getOrCreateCategory(categories, "Men", "Men's luxury fashion and everyday essentials");
            Category women = getOrCreateCategory(categories, "Women", "Women's luxury fashion and occasionwear");
            Category children = getOrCreateCategory(categories, "Children", "Kids luxury apparel, footwear, and accessories");
            
            Category mensShirts = getOrCreateCategory(categories, "Men's Shirts", "Premium shirts for men");
            Category mensTshirts = getOrCreateCategory(categories, "Men's T-Shirts", "Casual and premium t-shirts for men");
            Category sneakers = getOrCreateCategory(categories, "Sneakers", "Luxury and street sneakers");
            Category sportsShoes = getOrCreateCategory(categories, "Sports Shoes", "Performance sports footwear");
            Category casualShoes = getOrCreateCategory(categories, "Casual Shoes", "Everyday casual shoes");
            Category formalShoes = getOrCreateCategory(categories, "Formal Shoes", "Classic formal shoes");

            // Upsert the 28 premium products with high stock levels to prevent foreign key errors
            upsertProduct(products, 1L, "Oxford Cotton Shirt", 
                    "Smart regular-fit shirt for office and weekend styling, tailored from premium long-staple cotton.", 
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L,XL", 1499, 150, men,
                    "Luxe Classic", "White,Blue,Soft Pink", 
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Long-Staple Cotton\nFit: Regular Fit\nCollar: Button-Down Collar\nSleeve: Long Sleeves\nPattern: Solid\nCare: Machine wash warm, iron medium");

            upsertProduct(products, 2L, "Urban Bomber Jacket", 
                    "Lightweight jacket with ribbed cuffs, premium zippers, and a clean streetwear finish.", 
                    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80", 
                    "M,L,XL", 3499, 120, men,
                    "StreetElite", "Black,Olive Green,Navy", 
                    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=900&q=80", 
                    "Material: Water-Resistant Nylon Shell\nLining: Satin Polyester\nFit: Athletic Bomber Fit\nPockets: 2 side zipper pockets, 1 sleeve zip pouch\nWeight: Medium-weight\nCare: Dry clean recommended");

            upsertProduct(products, 3L, "Slim Stretch Denim", 
                    "Dark wash jeans with flexible stretch fabric for maximum comfort and modern tapered fit.", 
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80", 
                    "30,32,34,36", 2299, 180, men,
                    "DenimCraft", "Dark Indigo,Charcoal,Stone Wash", 
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80", 
                    "Material: 98% Cotton, 2% Elastane Lycra\nFit: Slim Fit\nRise: Mid-Rise\nClosure: Button fly with branded shank button\nWash: Dark Indigo indigo-dyed\nCare: Wash inside out with similar colors");

            upsertProduct(products, 4L, "Floral Midi Dress", 
                    "Flowing midi dress with soft floral print, relaxed silhouette, and premium georgette lining.", 
                    "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=80", 
                    "XS,S,M,L", 2799, 110, women,
                    "Aura London", "Floral Crimson,Pastel Lavender", 
                    "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Recycled Polyester Georgette\nLining: Soft Viscose Lining\nFit: Fit and Flare\nLength: Midi\nDetail: Tiered skirt, smocked back panel\nCare: Hand wash cold, line dry");

            upsertProduct(products, 5L, "Satin Evening Top", 
                    "Elegant satin top with a polished cowl neck drape for sophisticated evening looks.", 
                    "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L", 1799, 140, women,
                    "Atelier Gold", "Champagne Gold,Emerald Green,Jet Black", 
                    "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80", 
                    "Material: Premium Silk Satin (95% Silk, 5% Spandex)\nFit: Semi-fitted\nNeckline: Draped Cowl Neck\nSleeves: Sleeveless\nCare: Dry clean or cold delicate wash in mesh bag");

            upsertProduct(products, 6L, "Tailored Blazer Dress", 
                    "Structured double-breasted blazer dress with sharp lapels and a premium tailored finish.", 
                    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L,XL", 4299, 100, women,
                    "Atelier Gold", "Ivory White,Midnight Black", 
                    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80", 
                    "Material: Premium Wool Blend (60% Polyester, 40% Wool)\nLining: 100% Jacquard Silk Lining\nFit: Tailored Structured Fit\nButtons: Embossed Gold Buttons\nCare: Dry clean only");

            upsertProduct(products, 7L, "Classic Gold Chronograph", 
                    "Water-resistant stainless steel watch with metallic gold dial and premium leather strap.", 
                    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 12999, 150, men,
                    "Atelier Gold", "Gold,Black", 
                    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80", 
                    "Type: Chronograph\nCase: 42mm Stainless Steel\nDial: 24K Gold-plated\nMovement: Swiss Quartz\nStrap: Genuine Italian Leather\nWater Resistance: 50m (5 ATM)\nWarranty: 2 Years");

            upsertProduct(products, 8L, "Silk Wrap Midi Skirt", 
                    "A beautifully draped midi skirt made from luxury mulberry silk with an adjustable tie waist.", 
                    "https://images.unsplash.com/photo-1583496661160-fb488b2c1a82?auto=format&fit=crop&w=900&q=80", 
                    "XS,S,M,L", 3899, 120, women,
                    "Aura London", "Champagne,Emerald,Black", 
                    "https://images.unsplash.com/photo-1583496661160-fb488b2c1a82?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1577900232427-18219b9166a0?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Mulberry Silk\nLength: Midi\nFit: Adjustable Wrap Fit\nPattern: Solid Satin\nCare: Dry clean or cold hand wash only");

            upsertProduct(products, 9L, "Tailored Double-Breasted Suit", 
                    "A premium Italian wool-blend suit featuring sharp notch lapels and structured shoulder construction.", 
                    "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80", 
                    "46,48,50,52,54", 14999, 80, men,
                    "Luxe Classic", "Midnight Black,Charcoal Grey", 
                    "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80", 
                    "Material: 70% Wool, 30% Silk Blend\nLining: Full Bemberg Silk Lining\nLapel: Notch Lapel\nFit: Slim Fit Tailored\nClosure: Double-Breasted 6-Button\nCare: Professional Dry Clean Only");

            upsertProduct(products, 10L, "Velvet Cocktail Gown", 
                    "An exquisite floor-length evening gown crafted from plush silk velvet with an elegant side slit.", 
                    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L,XL", 8999, 95, women,
                    "Atelier Gold", "Burgundy,Royal Navy,Emerald", 
                    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80", 
                    "Material: 80% Rayon, 20% Silk Velvet\nLength: Floor Length Gown\nFit: Sculpted Bodycon Fit\nDetails: Off-shoulder neckline, side slit\nCare: Dry clean only");

            upsertProduct(products, 11L, "Leather Chelsea Boots", 
                    "Handcrafted Italian leather boots with elasticated side panels and a stacked wooden heel.", 
                    "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=900&q=80", 
                    "8,9,10,11", 5499, 110, men,
                    "DenimCraft", "Tan Brown,Jet Black", 
                    "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80", 
                    "Material: Hand-burnished Calfskin Leather\nLining: Leather Lined Insole\nSole: Stacked Wood & Rubber Outer Sole\nConstruction: Goodyear Welted\nHeel: 1.2 inches");

            upsertProduct(products, 12L, "Designer Sunglasses", 
                    "Premium tortoiseshell acetate frames featuring UV400 protective polarized lenses and gold metal branding.", 
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 2499, 200, women,
                    "Aura London", "Tortoiseshell,Midnight Black", 
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80,https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80", 
                    "Frame Material: High-quality Acetate\nLenses: Polarized UV400 Protection\nBrand hardware: Gold plated signature logo\nInclude: Leather hard case and cleaning cloth");

            upsertProduct(products, 13L, "High-Waist Stretch Denim Jeans", 
                    "Classic skinny-fit denim jeans with subtle washes and stretch cotton fabric for active comfort.", 
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80", 
                    "26,28,30,32", 2499, 150, women,
                    "DenimCraft", "Classic Blue,Charcoal Black", 
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80", 
                    "Material: 97% Cotton, 3% Elastane\nFit: High-rise Skinny Fit\nClosure: Zip Fly with Button\nWash: Medium Indigo Washed\nCare: Wash cold, tumble dry low");

            upsertProduct(products, 14L, "Premium Crewneck T-Shirt", 
                    "An essential soft crewneck t-shirt crafted from fine long-staple combed cotton.", 
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L,XL", 999, 180, men,
                    "StreetElite", "Black,White,Charcoal", 
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Combed Cotton\nFit: Regular Fit\nNeckline: Ribbed Crew Neck\nCare: Machine wash warm, tumble dry");

            upsertProduct(products, 15L, "Organic Cotton V-Neck Tee", 
                    "Breathable organic cotton tee with a flattering V-neck cut and structured lightweight drape.", 
                    "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80", 
                    "XS,S,M,L", 1199, 160, women,
                    "StreetElite", "Rose Pink,Classic White,Soft Lavender", 
                    "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Certified Organic Cotton\nFit: Classic V-neck Fit\nWeight: Lightweight 140 GSM\nCare: Hand wash or cold machine wash");

            upsertProduct(products, 16L, "Performance Flyknit Sports Shoes", 
                    "Ultra-lightweight sports running shoes with responsive foam cushion and breathable Flyknit upper.", 
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", 
                    "8,9,10,11", 4999, 140, men,
                    "StreetElite", "Red/Black,Electric Green", 
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", 
                    "Type: Sports / Running\nUpper: Seamless Flyknit Mesh\nSole: Responsive EVA Foam Cushioning\nWeight: 240g per shoe\nFeature: Slip-on collar fit with custom laces");

            upsertProduct(products, 17L, "Active Comfort Walking Sneakers", 
                    "Sleek and supportive athletic walking sneakers with memory foam insoles and textured slip-resistant outsoles.", 
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80", 
                    "5,6,7,8", 4499, 130, women,
                    "StreetElite", "Blush Pink,Snow White", 
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80", 
                    "Type: Athleisure / Walking\nUpper: Knit Breathable Fabric\nInsole: Arch-support Memory Foam\nClosure: Classic Lace-up\nSole: Flex-groove Rubber");

            upsertProduct(products, 18L, "Kids Play-All Velcro Sneakers", 
                    "Durable children's play shoes featuring double hook-and-loop velcro straps and rubber toe bumpers.", 
                    "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80", 
                    "2,3,4,5", 1899, 150, children,
                    "DenimCraft", "Blue/Red,Pink/White", 
                    "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80", 
                    "Category: Kids Footwear\nMaterial: Synthetic Mesh Upper\nClosure: Adjustable Double Velcro Straps\nSole: Flexible Non-marking Rubber\nDetails: Cushioned ankle collar for active support");

            upsertProduct(products, 19L, "Kids Graphic Crewneck Tee", 
                    "Fun, colorful graphic cartoon tee made from soft organic cotton jersey for sensitive skin.", 
                    "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80", 
                    "2-3Y,4-5Y,6-7Y", 699, 200, children,
                    "StreetElite", "Sunshine Yellow,Sky Blue", 
                    "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Organic Jersey Cotton\nFit: Relaxed Kids Fit\nNeckline: Ribbed Crew Neck\nCare: Wash inside-out in cold water, iron on reverse");

            upsertProduct(products, 20L, "Kids Flexible UV400 Sunglasses", 
                    "Unbreakable TPEE rubber frame sunglasses for children offering 100% protective polarized UV400 lenses.", 
                    "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 899, 150, children,
                    "Aura London", "Neon Pink,Electric Yellow", 
                    "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=80", 
                    "Frame: Unbreakable Flexible Rubber (TPEE)\nLenses: Polarized UV400 Shatterproof Polycarbonate\nAge Group: 3-10 Years\nPackage: Includes safety lanyard strap and cloth pouch");

            upsertProduct(products, 21L, "Classic Aviator Goggles", 
                    "Iconic gold metallic frame pilot aviators featuring glass polarized lenses and soft nose pad rests.", 
                    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 2999, 160, men,
                    "Aura London", "Black Gradient,Gold Green", 
                    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80", 
                    "Frame Material: Lightweight Gold-Plated Alloy\nLenses: G-15 Polarized Tempered Glass\nProtection: UVA & UVB 100% (UV400)\nBridge width: 14mm\nTemple length: 135mm");

            upsertProduct(products, 22L, "Premium Modal Boxer Briefs (3-Pack)", 
                    "Ultra-soft modal blend boxer briefs featuring a tagless comfort waistband and anti-chafing flatlock seams.", 
                    "https://images.unsplash.com/photo-1582845512747-e426d116db9a?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L,XL", 1299, 180, men,
                    "Luxe Classic", "Multi-Color Pack", 
                    "https://images.unsplash.com/photo-1582845512747-e426d116db9a?auto=format&fit=crop&w=900&q=80", 
                    "Material: 92% MicroModal, 8% Elastane\nInseam: 5 inches\nPackage: 3 boxer briefs (1 Black, 1 Navy, 1 Charcoal Grey)\nCare: Cold wash, do not bleach");

            upsertProduct(products, 23L, "Seamless Comfort Set", 
                    "Breathable seamless stretch wire-free bralette and micro-fiber briefs set with a clean laser-cut finish.", 
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80", 
                    "S,M,L", 1499, 170, women,
                    "Luxe Classic", "Nude Pink,Midnight Black", 
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80", 
                    "Material: 88% Nylon, 12% Spandex Microfiber\nSet Includes: 1 Wire-free Plunge Bralette, 1 Laser-cut Hipster Brief\nDetails: Removable modesty cups, tagless labels");

            upsertProduct(products, 24L, "Kids Comfort Stretch Jeans", 
                    "Adjustable inner waistband stretch denim jeans for active boys and girls.", 
                    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80", 
                    "4Y,6Y,8Y,10Y", 1599, 125, children,
                    "DenimCraft", "Light Blue,Stone Denim", 
                    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80", 
                    "Material: 98% Cotton Denim, 2% Spandex\nFeature: Interior buttonhole elastic tabs for customizable waist sizing\nFit: Straight leg utility fit\nCare: Wash warm inside out");

            upsertProduct(products, 25L, "Kids Plaid Flannel Shirt", 
                    "Double-brushed cotton flannel button-down shirt with chest patch pockets for cool-weather styling.", 
                    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80", 
                    "4Y,6Y,8Y,10Y", 1299, 130, children,
                    "Luxe Classic", "Red Plaid,Forest Green Plaid", 
                    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Brushed Cotton Flannel\nSleeve: Long sleeves with double-button barrel cuffs\nCollar: Classic pointed collar\nCare: Tumble dry medium, warm iron if needed");

            upsertProduct(products, 26L, "Saffiano Belt & Wallet Gift Set", 
                    "Sophisticated gift bundle featuring a scratch-resistant Saffiano leather belt with silver buckle and matching bi-fold wallet.", 
                    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 3499, 150, men,
                    "Luxe Classic", "Jet Black,Classic Brown", 
                    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80", 
                    "Belt Material: Full-grain Saffiano Leather\nWallet capacity: 8 card slots, 2 cash compartments, 1 photo ID window\nBuckle: Silver brushed stainless steel clamp buckle\nPackaging: Luxury textured gold-embossed gift box");

            upsertProduct(products, 27L, "Structured Leather Tote Bag", 
                    "A spacious luxury handbag crafted from textured calfskin leather, complete with dual top handles and gold hardware.", 
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 7999, 120, women,
                    "Atelier Gold", "Tan Honey,Cream White", 
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", 
                    "Material: 100% Italian Calfskin Leather\nDimensions: 14\" W x 11\" H x 6\" D\nHardware: Gold polished metal feet and dual zippers\nLining: Soft microsuede protective interior");

            upsertProduct(products, 28L, "Kids Cute Animal Backpack", 
                    "Lightweight kids' mini backpack featuring a playful animal pattern, spacious main pocket, and padded safety straps.", 
                    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80", 
                    "One Size", 1499, 110, children,
                    "Aura London", "Cute Panda,Dino Green", 
                    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80", 
                    "Material: Water-resistant durable Oxford fabric\nSize: 12\" H x 9\" W x 4.5\" D (ideal for kindergarten)\nSafety: Integrated whistle on chest strap buckles, reflective security piping");

            upsertProduct(products, 29L, "Men's Ankle-Collar Sock Sneakers", 
                    "Premium street-style running sneakers featuring a sock-like stretch knit ankle collar and responsive cushioned sole.", 
                    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80", 
                    "8,9,10,11", 5999, 120, men,
                    "StreetElite", "All Black,White/Gum", 
                    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80", 
                    "Upper: Sock-like stretch knit\nCollar: High-top ankle neck collar\nSole: Lightweight responsive foam\nFit: Snug wrap fit");

            upsertProduct(products, 30L, "Women's Knit-Neck Collar Sneakers", 
                    "Feminine athletic walking sneakers with a flexible rib-knit ankle neck collar and air-bubble sole cushion.", 
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80", 
                    "5,6,7,8", 5499, 110, women,
                    "StreetElite", "Rose Gold,Grey Melange", 
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80", 
                    "Upper: Stretchy flyknit weave\nCollar: Ribbed elastic neck collar\nInsole: Arch support memory foam\nClosure: Slip-on with pull tabs");

            upsertProduct(products, 31L, "Kids Elastic-Collar Sock Sneakers", 
                    "Comfy slip-on sock sneakers for children featuring high-stretch ankle neck collars and reinforced toe caps for playground protection.", 
                    "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80", 
                    "2,3,4,5", 2299, 100, children,
                    "DenimCraft", "Red/Black,Pink/Purple", 
                    "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80", 
                    "Upper: Seamless dynamic stretch knit\nCollar: Double elastic ankle neck collar\nFeatures: Breathable, anti-collision toe wrap\nSole: Soft traction rubber");

            // Dynamic Seeding of Large Product Collection (80+ items requested, 94 items seeded)
            
            // Seed Men's Shirts (IDs 101 to 122)
            String[] shirtBrands = {"Atelier Gold", "Luxe Classic", "Prada", "Gucci", "Burberry"};
            String[] shirtColors = {"White", "Blue", "Black", "Pink", "Lavender", "Grey"};
            String[] shirtImages = {
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80"
            };
            for (int i = 1; i <= 22; i++) {
                String name = "Signature Cotton Shirt Vol. " + i;
                String brand = shirtBrands[i % shirtBrands.length];
                String color = shirtColors[i % shirtColors.length] + "," + shirtColors[(i + 1) % shirtColors.length];
                String img = shirtImages[i % shirtImages.length];
                int price = 1499 + (i * 120);
                int stock = 100 + (i * 5);
                String desc = "A high-end, premium regular-fit cotton shirt featuring expert tailoring, ideal for both formal business meetings and polished weekend looks.";
                String specs = "Material: 100% Cotton\nFit: Regular Tailored\nCare: Machine Wash Warm\nOrigin: Imported";
                upsertProduct(products, 100L + i, name, desc, img, "S,M,L,XL,XXL", price, stock, mensShirts, brand, color, img + "," + img, specs);
            }

            // Seed Men's T-Shirts (IDs 201 to 222)
            String[] tBrands = {"StreetElite", "Aura London", "Versace", "Saint Laurent", "Zara"};
            String[] tColors = {"Black", "White", "Navy Blue", "Red", "Olive Green", "Charcoal"};
            String[] tImages = {
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
            };
            for (int i = 1; i <= 22; i++) {
                String name = "Premium Comfort Tee Vol. " + i;
                String brand = tBrands[i % tBrands.length];
                String color = tColors[i % tColors.length] + "," + tColors[(i + 1) % tColors.length];
                String img = tImages[i % tImages.length];
                int price = 799 + (i * 60);
                int stock = 120 + (i * 4);
                String desc = "An everyday luxury basic. Crafted from super-soft combed organic cotton for maximum comfort and style.";
                String specs = "Material: 100% Organic Combed Cotton\nFit: Slim Fit\nNeck: Crew Neck\nCare: Cold wash inside out";
                upsertProduct(products, 200L + i, name, desc, img, "S,M,L,XL", price, stock, mensTshirts, brand, color, img + "," + img, specs);
            }

            // Seed Sneakers (IDs 301 to 322)
            String[] sneakerBrands = {"StreetElite", "DenimCraft", "Gucci", "Louis Vuitton", "Balenciaga"};
            String[] sneakerColors = {"White/Black", "Triple Black", "Gold/White", "Grey/Orange", "Beige/Tan"};
            String[] sneakerImages = {
                "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80"
            };
            for (int i = 1; i <= 22; i++) {
                String name = "Urban Lux Sneaker Vol. " + i;
                String brand = sneakerBrands[i % sneakerBrands.length];
                String color = sneakerColors[i % sneakerColors.length];
                String img = sneakerImages[i % sneakerImages.length];
                int price = 3999 + (i * 250);
                int stock = 80 + (i * 3);
                String desc = "High-end urban street sneakers designed with double elastic neck-collar ankle grips and premium performance materials.";
                String specs = "Upper: Premium Knit & Mesh\nCollar: High elastic sock collar\nSole: Thick rubber traction\nDesign: Luxury streetwear";
                upsertProduct(products, 300L + i, name, desc, img, "7,8,9,10,11", price, stock, sneakers, brand, color, img + "," + img, specs);
            }

            // Seed Sports Shoes (IDs 401 to 422)
            String[] sportsBrands = {"StreetElite", "Nike", "Adidas", "Puma", "Asics"};
            String[] sportsColors = {"Neon Green", "Carbon Black", "Racing Red", "Ocean Blue", "Pure White"};
            String[] sportsImages = {
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80"
            };
            for (int i = 1; i <= 22; i++) {
                String name = "Performance Trainer Vol. " + i;
                String brand = sportsBrands[i % sportsBrands.length];
                String color = sportsColors[i % sportsColors.length];
                String img = sportsImages[i % sportsImages.length];
                int price = 2999 + (i * 200);
                int stock = 90 + (i * 4);
                String desc = "Engineered for active speed and responsive performance, featuring breathing mesh layers and dynamic traction grips.";
                String specs = "Upper: Dual flyknit weave\nMidsole: High-rebound foam cushioning\nSole: Specialized carbon rubber\nWeight: 220g per shoe";
                upsertProduct(products, 400L + i, name, desc, img, "6,7,8,9,10,11", price, stock, sportsShoes, brand, color, img + "," + img, specs);
            }

            // Seed Casual Shoes (IDs 501 to 510)
            String[] casualBrands = {"DenimCraft", "Aura London", "Timberland", "Clarks"};
            String[] casualColors = {"Tan Brown", "Desert Sand", "Suede Grey", "Navy Blue"};
            String[] casualImages = {
                "https://images.unsplash.com/photo-1531310197839-ccf54664f2c5?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"
            };
            for (int i = 1; i <= 10; i++) {
                String name = "Signature Casual Loafer " + i;
                String brand = casualBrands[i % casualBrands.length];
                String color = casualColors[i % casualColors.length];
                String img = casualImages[i % casualImages.length];
                int price = 2499 + (i * 150);
                int stock = 70 + (i * 5);
                String desc = "Classy daily loafers or boots crafted from fine brushed suede leather with highly durable ortholite insole support.";
                String specs = "Material: Premium Brushed Suede Leather\nLining: Soft breathable leather\nSole: Flexible synthetic rubber\nStyle: Slip-on loafers";
                upsertProduct(products, 500L + i, name, desc, img, "7,8,9,10,11", price, stock, casualShoes, brand, color, img + "," + img, specs);
            }

            // Seed Formal Shoes (IDs 601 to 610)
            String[] formalBrands = {"Atelier Gold", "Luxe Classic", "Prada", "Salvatore Ferragamo"};
            String[] formalColors = {"Polished Black", "Oxford Tan", "Mahogany Brown", "Midnight Burgundy"};
            String[] formalImages = {
                "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80",
                "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=80"
            };
            for (int i = 1; i <= 10; i++) {
                String name = "Hand-Burnished Oxford " + i;
                String brand = formalBrands[i % formalBrands.length];
                String color = formalColors[i % formalColors.length];
                String img = formalImages[i % formalImages.length];
                int price = 6999 + (i * 400);
                int stock = 50 + (i * 3);
                String desc = "Exquisite hand-finished Italian calfskin oxford dress shoes, featuring elegant brogue wingtip detailing and stack leather heels.";
                String specs = "Material: Full-grain Italian Calfskin\nConstruction: Blake stitched\nHeel: Stacked leather heel (1.1 inches)\nClosure: Closed lacing Oxford";
                upsertProduct(products, 600L + i, name, desc, img, "7,8,9,10,11", price, stock, formalShoes, brand, color, img + "," + img, specs);
            }
        };
    }

    private Category getOrCreateCategory(CategoryRepository repository, String name, String description) {
        return repository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Category c = new Category();
                    c.setName(name);
                    c.setDescription(description);
                    return repository.save(c);
                });
    }

    private Category category(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return category;
    }

    private void upsertProduct(ProductRepository repository, Long id, String name, String description, String imageUrl, String sizes,
                               int price, int stock, Category category, String brand, String colors, String imageUrls, String specifications) {
        Product product = repository.findById(id).orElseGet(Product::new);
        product.setId(id);
        product.setName(name);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        product.setSizes(sizes);
        product.setPrice(BigDecimal.valueOf(price));
        product.setStock(stock);
        product.setCategory(category);
        product.setBrand(brand);
        product.setColors(colors);
        product.setImageUrls(imageUrls);
        product.setSpecifications(specifications);
        
        int discount = 0;
        if (id % 5 == 1) discount = 10;
        else if (id % 5 == 2) discount = 15;
        else if (id % 5 == 3) discount = 20;
        else if (id % 5 == 4) discount = 25;
        else if (id % 5 == 0) discount = 30;
        product.setDiscountPercentage(discount);

        repository.save(product);
    }
}
