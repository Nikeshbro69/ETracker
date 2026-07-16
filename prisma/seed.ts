import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱  Seeding database...");

  // ── 1. Roles ──────────────────────────────────────────────────────────────
  const accountantRole = await prisma.role.upsert({
    where: { name: "accountant" },
    update: {},
    create: { name: "accountant", description: "Full access to finance module" },
  });

  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Future: system administration" },
  });

  await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {},
    create: { name: "super_admin", description: "Future: super administration" },
  });

  console.log("✅  Roles seeded");

  // ── 2. Default accountant user ────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin@1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@digitalpathshala.com" },
    update: {},
    create: {
      full_name: "Digital Pathshala Admin",
      email: "admin@digitalpathshala.com",
      password: passwordHash,
    },
  });

  // Assign accountant role
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: user.id, role_id: accountantRole.id } },
    update: {},
    create: { user_id: user.id, role_id: accountantRole.id },
  });

  console.log(`✅  Default user seeded — email: admin@digitalpathshala.com  password: Admin@1234`);

  // ── 3. Income categories ──────────────────────────────────────────────────
  const incomeCategories = [
    { name: "Software Development",  description: "Custom software and web application development revenue." },
    { name: "Website Development",   description: "Static and dynamic website development projects." },
    { name: "Mobile App Development",description: "iOS and Android application development." },
    { name: "ERP Development",       description: "Enterprise resource planning system development." },
    { name: "Government Project",    description: "Projects contracted with government entities." },
    { name: "School Training",       description: "IT training programs delivered to school students." },
    { name: "College Training",      description: "IT training programs delivered to college students." },
    { name: "Corporate Training",    description: "IT training delivered to corporate organizations." },
    { name: "Online Class",          description: "Online / remote training sessions." },
    { name: "Physical Class",        description: "In-person classroom training sessions." },
    { name: "Consultancy",           description: "IT consultancy and advisory services." },
    { name: "AMC / Maintenance",     description: "Annual maintenance contracts and support retainers." },
    { name: "Hosting Services",      description: "Web hosting service revenue." },
    { name: "Domain Services",       description: "Domain registration and renewal revenue." },
    { name: "Other",                 description: "Income that does not fit other categories." },
  ];

  for (const cat of incomeCategories) {
    await prisma.incomeCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log(`✅  ${incomeCategories.length} income categories seeded`);

  // ── 4. Expense categories ─────────────────────────────────────────────────
  const expenseCategories = [
    // Employee
    { group_name: "Employee",       name: "Salary",               description: "Monthly salary payments to full-time employees." },
    { group_name: "Employee",       name: "Bonus",                description: "Performance or festival bonuses." },
    { group_name: "Employee",       name: "Allowance",            description: "Transport, meal, or other allowances." },
    { group_name: "Employee",       name: "Freelancer Payment",   description: "Payments to freelance contractors." },
    // Office
    { group_name: "Office",         name: "Rent",                 description: "Office space rental payments." },
    { group_name: "Office",         name: "Electricity",          description: "Electricity utility bills." },
    { group_name: "Office",         name: "Water",                description: "Water utility bills." },
    { group_name: "Office",         name: "Internet",             description: "Internet/broadband subscription." },
    { group_name: "Office",         name: "Stationery",           description: "Paper, pens, and general stationery." },
    { group_name: "Office",         name: "Office Supplies",      description: "General office consumables." },
    { group_name: "Office",         name: "Furniture",            description: "Office furniture purchases." },
    { group_name: "Office",         name: "Maintenance",          description: "Office repairs and maintenance." },
    { group_name: "Office",         name: "Cleaning",             description: "Cleaning services and supplies." },
    // IT
    { group_name: "IT",             name: "Server",               description: "Physical or cloud server costs." },
    { group_name: "IT",             name: "Hosting",              description: "Web/app hosting subscriptions." },
    { group_name: "IT",             name: "Domain",               description: "Domain registration and renewals." },
    { group_name: "IT",             name: "SSL",                  description: "SSL certificate purchases." },
    { group_name: "IT",             name: "Software Subscription",description: "SaaS tool subscriptions (e.g., Figma, Notion)." },
    { group_name: "IT",             name: "API Charges",          description: "Third-party API usage fees." },
    // Marketing
    { group_name: "Marketing",      name: "Facebook Ads",         description: "Meta/Facebook advertising spend." },
    { group_name: "Marketing",      name: "Google Ads",           description: "Google advertising spend." },
    { group_name: "Marketing",      name: "Printing",             description: "Banners, brochures, printed materials." },
    { group_name: "Marketing",      name: "Events",               description: "Event sponsorships and participation costs." },
    // Travel
    { group_name: "Travel",         name: "Fuel",                 description: "Fuel for company vehicles." },
    { group_name: "Travel",         name: "Travel",               description: "Bus, flight, or taxi travel costs." },
    { group_name: "Travel",         name: "Accommodation",        description: "Hotel or lodging costs." },
    // Entertainment
    { group_name: "Entertainment",  name: "Team Celebration",     description: "Team outing or party expenses." },
    { group_name: "Entertainment",  name: "Festival Celebration", description: "Dashain, Tihar, and other festival celebrations." },
    { group_name: "Entertainment",  name: "Office Lunch",         description: "Team lunch or refreshments." },
    { group_name: "Entertainment",  name: "Gifts",                description: "Client or employee gifts." },
    // Miscellaneous
    { group_name: "Miscellaneous",  name: "Taxes",                description: "Government tax payments." },
    { group_name: "Miscellaneous",  name: "Bank Charges",         description: "Bank service fees and transaction charges." },
    { group_name: "Miscellaneous",  name: "Miscellaneous",        description: "Expenses that do not fit other categories." },
  ];

  for (const cat of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log(`✅  ${expenseCategories.length} expense categories seeded`);
  console.log("\n🎉  Seeding complete!\n");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
