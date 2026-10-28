import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import type { SQL } from "drizzle-orm";
import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import { seedData } from "./seed-data";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const demoUserDomain = "%@demo.taxitap.test";
const demoAccountEmails = {
  "cust-thandi": "thandi@demo.taxitap.test",
  "driver-sipho": "sipho@demo.taxitap.test",
  "owner-mbeki": "mbeki@demo.taxitap.test",
  "admin-nomsa": "nomsa@demo.taxitap.test",
  "staff-zodwa": "zodwa@demo.taxitap.test",
} as const;
const demoOrganisationNames = seedData.organisations.map(({ name }) => name);
const demoAssociationNames = seedData.associations.map(({ name }) => name);
const demoAssociationNameSet = new Set<string>(demoAssociationNames);
const demoRouteNames = seedData.routes.map(({ name }) =>
  name.replace(" – ", " - "),
);
const systemFundsName = "Demo funds (system)";
const systemFundsCents = 2_000_000_000;
const thandiStartingBalanceCents = 20_000;

async function resetDemoData(
  db: typeof import("@/db").db,
  schema: typeof import("@/db/schema") & {
    user: typeof import("@/db/auth-schema").user;
  },
) {
  await db.transaction(async (tx) => {
    const demoUsers = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(like(schema.user.email, demoUserDomain));
    const userIds = demoUsers.map(({ id }) => id);
    const demoProfiles = await tx
      .select({ id: schema.profiles.id, authUserId: schema.profiles.authUserId })
      .from(schema.profiles)
      .where(
        userIds.length > 0
          ? inArray(schema.profiles.authUserId, userIds)
          : sql`false`,
      );
    const profileIds = demoProfiles.map(({ id }) => id);
    const demoOrganisations = await tx
      .select({ id: schema.organisations.id, name: schema.organisations.name })
      .from(schema.organisations)
      .where(
        inArray(schema.organisations.name, [
          ...demoOrganisationNames,
          ...demoAssociationNames,
        ]),
      );
    const organisationIds = demoOrganisations.map(({ id }) => id);
    const associationIds = demoOrganisations
      .filter(({ name }) => demoAssociationNameSet.has(name))
      .map(({ id }) => id);
    const demoRoutes = await tx
      .select({ id: schema.routes.id })
      .from(schema.routes)
      .where(inArray(schema.routes.name, [...demoRouteNames, ...seedData.routes.map(({ name }) => name)]));
    const routeIds = demoRoutes.map(({ id }) => id);
    const demoVehicles = await tx
      .select({ id: schema.vehicles.id })
      .from(schema.vehicles)
      .where(
        or(
          inArray(schema.vehicles.registration, seedData.vehicles.map(({ registration }) => registration)),
          organisationIds.length > 0
            ? inArray(schema.vehicles.ownerOrgId, organisationIds)
            : sql`false`,
        ),
      );
    const vehicleIds = demoVehicles.map(({ id }) => id);
    const demoBands = await tx
      .select({ id: schema.fareBands.id })
      .from(schema.fareBands)
      .where(
        routeIds.length > 0
          ? inArray(schema.fareBands.routeId, routeIds)
          : sql`false`,
      );
    const fareBandIds = demoBands.map(({ id }) => id);
    const demoTrips = await tx
      .select({ id: schema.trips.id })
      .from(schema.trips)
      .where(
        or(
          profileIds.length > 0
            ? inArray(schema.trips.driverId, profileIds)
            : sql`false`,
          vehicleIds.length > 0
            ? inArray(schema.trips.vehicleId, vehicleIds)
            : sql`false`,
          routeIds.length > 0
            ? inArray(schema.trips.routeId, routeIds)
            : sql`false`,
        ),
      );
    const tripIds = demoTrips.map(({ id }) => id);
    const demoWallets = await tx
      .select({ id: schema.wallets.id })
      .from(schema.wallets)
      .where(
        or(
          profileIds.length > 0
            ? and(
                eq(schema.wallets.ownerType, "profile"),
                inArray(schema.wallets.ownerId, profileIds),
              )
            : sql`false`,
          organisationIds.length > 0
            ? and(
                eq(schema.wallets.ownerType, "organisation"),
                inArray(schema.wallets.ownerId, organisationIds),
              )
            : sql`false`,
        ),
      );
    const walletIds = demoWallets.map(({ id }) => id);
    const [systemFundsOrg] = await tx
      .select({ id: schema.organisations.id })
      .from(schema.organisations)
      .where(eq(schema.organisations.name, systemFundsName))
      .limit(1);
    const [systemFundsWallet] = systemFundsOrg
      ? await tx
          .select({ id: schema.wallets.id, balanceCents: schema.wallets.balanceCents })
          .from(schema.wallets)
          .where(
            and(
              eq(schema.wallets.ownerType, "organisation"),
              eq(schema.wallets.ownerId, systemFundsOrg.id),
            ),
          )
          .limit(1)
      : [];
    const affectedTransactions =
      walletIds.length + tripIds.length + fareBandIds.length + profileIds.length
        ? await tx
            .select()
            .from(schema.transactions)
            .where(
              or(
                walletIds.length > 0
                  ? or(
                      inArray(schema.transactions.fromWalletId, walletIds),
                      inArray(schema.transactions.toWalletId, walletIds),
                    )
                  : sql`false`,
                tripIds.length > 0
                  ? inArray(schema.transactions.tripId, tripIds)
                  : sql`false`,
                fareBandIds.length > 0
                  ? inArray(schema.transactions.fareBandId, fareBandIds)
                  : sql`false`,
                profileIds.length > 0
                  ? inArray(schema.transactions.staffId, profileIds)
                  : sql`false`,
              ),
            )
        : [];

    // Deleting transactions is a development-only exception to the "ledger is never edited" rule.
    if (systemFundsWallet) {
      const fundsAdjustment = affectedTransactions.reduce((sum, transaction) => {
        if (transaction.status !== "success" || transaction.amountCents === null) {
          return sum;
        }
        if (transaction.fromWalletId === systemFundsWallet.id) {
          return sum + transaction.amountCents;
        }
        if (transaction.toWalletId === systemFundsWallet.id) {
          return sum - transaction.amountCents;
        }
        return sum;
      }, 0);
      if (fundsAdjustment !== 0) {
        await tx
          .update(schema.wallets)
          .set({
            balanceCents: sql`${schema.wallets.balanceCents} + ${fundsAdjustment}`,
          })
          .where(eq(schema.wallets.id, systemFundsWallet.id));
      }
    }

    if (walletIds.length > 0) {
      await tx
        .delete(schema.qrTokens)
        .where(inArray(schema.qrTokens.walletId, walletIds));
      await tx
        .delete(schema.nfcTags)
        .where(inArray(schema.nfcTags.walletId, walletIds));
    }
    const transactionIds = affectedTransactions.map(({ id }) => id);
    if (transactionIds.length > 0) {
      await tx
        .delete(schema.transactions)
        .where(inArray(schema.transactions.id, transactionIds));
    }
    if (tripIds.length > 0) {
      await tx.delete(schema.trips).where(inArray(schema.trips.id, tripIds));
    }
    const membershipFilters: SQL[] = [];
    if (profileIds.length > 0) {
      membershipFilters.push(inArray(schema.memberships.profileId, profileIds));
    }
    if (organisationIds.length > 0) {
      membershipFilters.push(
        inArray(schema.memberships.organisationId, organisationIds),
      );
    }
    if (membershipFilters.length > 0) {
      await tx.delete(schema.memberships).where(or(...membershipFilters));
    }
    if (organisationIds.length > 0) {
      await tx
        .delete(schema.stalls)
        .where(inArray(schema.stalls.ownerOrgId, organisationIds));
    }
    if (fareBandIds.length > 0) {
      await tx
        .delete(schema.fareBands)
        .where(inArray(schema.fareBands.id, fareBandIds));
    }
    if (vehicleIds.length > 0) {
      await tx.delete(schema.vehicles).where(inArray(schema.vehicles.id, vehicleIds));
    }
    if (routeIds.length > 0) {
      await tx.delete(schema.routes).where(inArray(schema.routes.id, routeIds));
    }
    if (walletIds.length > 0) {
      await tx.delete(schema.wallets).where(inArray(schema.wallets.id, walletIds));
    }
    if (profileIds.length > 0) {
      await tx
        .delete(schema.profiles)
        .where(inArray(schema.profiles.id, profileIds));
    }
    const nonAssociationIds = demoOrganisations
      .filter(({ id }) => !associationIds.includes(id))
      .map(({ id }) => id);
    if (nonAssociationIds.length > 0) {
      await tx
        .delete(schema.organisations)
        .where(inArray(schema.organisations.id, nonAssociationIds));
    }
    if (associationIds.length > 0) {
      await tx
        .delete(schema.organisations)
        .where(inArray(schema.organisations.id, associationIds));
    }
    if (userIds.length > 0) {
      await tx.delete(schema.user).where(inArray(schema.user.id, userIds));
    }
  });
}

async function ensureWallet(
  db: typeof import("@/db").db,
  schema: typeof import("@/db/schema"),
  ownerType: "profile" | "organisation",
  ownerId: string,
) {
  await db
    .insert(schema.wallets)
    .values({ ownerType, ownerId, balanceCents: 0 })
    .onConflictDoNothing({
      target: [schema.wallets.ownerType, schema.wallets.ownerId],
    });
  const [wallet] = await db
    .select()
    .from(schema.wallets)
    .where(
      and(
        eq(schema.wallets.ownerType, ownerType),
        eq(schema.wallets.ownerId, ownerId),
      ),
    )
    .limit(1);
  if (!wallet) throw new Error(`Could not ensure ${ownerType} wallet`);
  return wallet;
}

async function ensureDemoFundsWallet(
  db: typeof import("@/db").db,
  schema: typeof import("@/db/schema"),
) {
  let [organisation] = await db
    .select()
    .from(schema.organisations)
    .where(eq(schema.organisations.name, systemFundsName))
    .limit(1);
  if (!organisation) {
    [organisation] = await db
      .insert(schema.organisations)
      .values({ name: systemFundsName, type: "business" })
      .returning();
  }
  await db
    .insert(schema.wallets)
    .values({
      ownerType: "organisation",
      ownerId: organisation.id,
      balanceCents: systemFundsCents,
    })
    .onConflictDoNothing({
      target: [schema.wallets.ownerType, schema.wallets.ownerId],
    });
  return ensureWallet(db, schema, "organisation", organisation.id);
}

async function findOrCreateOrganisation(
  db: typeof import("@/db").db,
  schema: typeof import("@/db/schema"),
  name: string,
  type: "association" | "business" | "merchant",
  associationId?: string,
) {
  let [organisation] = await db
    .select()
    .from(schema.organisations)
    .where(eq(schema.organisations.name, name))
    .limit(1);
  if (!organisation) {
    [organisation] = await db
      .insert(schema.organisations)
      .values({ name, type, associationId })
      .returning();
  }
  return organisation;
}

async function main() {
  const args = process.argv.slice(2);
  const resetting = args.includes("--reset");
  const confirmed = args.includes("--yes");

  if (resetting && !confirmed) {
    const databaseHost = process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).host
      : "unavailable (DATABASE_URL is not set)";
    console.log(`Reset would connect to database host: ${databaseHost}`);
    console.log(
      "It would delete demo-domain users and linked profiles, wallets, transactions, trips, memberships, stalls, QR/NFC tags, organisations, routes, fare bands, and vehicles; then recreate demo data.",
    );
    console.log("Nothing was changed. Re-run with --reset --yes to confirm.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Set it in .env.local.");
  }
  const password = process.env.DEMO_PASSWORD;
  if (!password) {
    throw new Error("DEMO_PASSWORD is required to seed demo accounts.");
  }

  const [{ db }, schemaModule, { user }, { auth }, { transfer }] =
    await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("@/db/auth-schema"),
      import("@/server/auth"),
      import("@/server/ledger"),
    ]);
  const schema = { ...schemaModule, user };
  if (resetting) await resetDemoData(db, schema);

  const organisations = new Map<string, { id: string }>();
  const association = await findOrCreateOrganisation(
    db,
    schema,
    seedData.associations[0].name,
    "association",
  );
  organisations.set(seedData.associations[0].key, association);
  for (const organisationData of seedData.organisations) {
    const parent =
      "associationKey" in organisationData
        ? organisations.get(organisationData.associationKey)
        : undefined;
    const organisation = await findOrCreateOrganisation(
      db,
      schema,
      organisationData.name,
      organisationData.type === "owner-business"
        ? "business"
        : organisationData.type,
      parent?.id,
    );
    organisations.set(organisationData.key, organisation);
  }

  const profiles = new Map<string, { id: string }>();
  for (const profileData of seedData.profiles) {
    const email = demoAccountEmails[profileData.key];
    const [existingAuthUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    let authUserId = existingAuthUser?.id;
    if (!authUserId) {
      const signup = await auth.api.signUpEmail({
        body: { email, password, name: profileData.name },
        headers: new Headers(),
      });
      authUserId = signup.user.id;
    }
    let [profile] = await db
      .select()
      .from(schemaModule.profiles)
      .where(eq(schemaModule.profiles.authUserId, authUserId))
      .limit(1);
    if (!profile) {
      [profile] = await db
        .insert(schemaModule.profiles)
        .values({
          authUserId,
          name: profileData.name,
          role: profileData.role,
        })
        .returning();
    }
    profiles.set(profileData.key, profile);
  }

  const routes = new Map<string, { id: string }>();
  for (const routeData of seedData.routes) {
    const routeName = routeData.name.replace(" – ", " - ");
    const [existingRoute] = await db
      .select()
      .from(schemaModule.routes)
      .where(eq(schemaModule.routes.name, routeName))
      .limit(1);
    const route =
      existingRoute ??
      (
        await db
          .insert(schemaModule.routes)
          .values({
            name: routeName,
            associationId: association.id,
            fareModel: routeData.fareModel,
          })
          .returning()
      )[0];
    routes.set(routeData.key, route);
    for (const [sortOrder, bandData] of routeData.bands.entries()) {
      const [existingBand] = await db
        .select()
        .from(schemaModule.fareBands)
        .where(
          and(
            eq(schemaModule.fareBands.routeId, route.id),
            eq(schemaModule.fareBands.label, bandData.name),
          ),
        )
        .limit(1);
      if (!existingBand) {
        await db.insert(schemaModule.fareBands).values({
          routeId: route.id,
          label: bandData.name,
          amountCents: bandData.amountCents,
          sortOrder,
        });
      }
    }
  }

  for (const vehicleData of seedData.vehicles) {
    const ownerOrganisation = organisations.get(vehicleData.ownerOrganisationKey);
    if (!ownerOrganisation) throw new Error("Vehicle owner organisation is missing");
    const routeData = seedData.routes[0];
    const route = routes.get(routeData.key);
    const [vehicle] = await db
      .select()
      .from(schemaModule.vehicles)
      .where(eq(schemaModule.vehicles.registration, vehicleData.registration))
      .limit(1);
    if (!vehicle) {
      await db.insert(schemaModule.vehicles).values({
        registration: vehicleData.registration,
        ownerOrgId: ownerOrganisation.id,
        routeId:
          vehicleData.registration === seedData.vehicles[0].registration
            ? route?.id
            : undefined,
      });
    } else if (
      vehicleData.registration === seedData.vehicles[0].registration &&
      !vehicle.routeId &&
      route
    ) {
      await db
        .update(schemaModule.vehicles)
        .set({ routeId: route.id })
        .where(eq(schemaModule.vehicles.id, vehicle.id));
    }
  }

  for (const membershipData of [
    {
      profileKey: "driver-sipho",
      organisationKey: "org-mbeki-taxis",
      role: "driver",
    },
    {
      profileKey: "owner-mbeki",
      organisationKey: "org-mbeki-taxis",
      role: "owner",
    },
    {
      profileKey: "admin-nomsa",
      organisationKey: "assoc-durban",
      role: "association_admin",
    },
    {
      profileKey: "staff-zodwa",
      organisationKey: "org-zodwa-stall",
      role: "merchant_staff",
    },
  ]) {
    const profile = profiles.get(membershipData.profileKey);
    const organisation = organisations.get(membershipData.organisationKey);
    if (!profile || !organisation) throw new Error("Demo membership target is missing");
    await db
      .insert(schemaModule.memberships)
      .values({
        profileId: profile.id,
        organisationId: organisation.id,
        role: membershipData.role,
      })
      .onConflictDoNothing({
        target: [
          schemaModule.memberships.profileId,
          schemaModule.memberships.organisationId,
        ],
      });
  }

  for (const stallData of [
    {
      name: "Mama Zodwa's Stall (demo)",
      ownerOrganisationKey: "org-zodwa-stall",
      location: null,
    },
  ]) {
    const ownerOrganisation = organisations.get(stallData.ownerOrganisationKey);
    if (!ownerOrganisation) throw new Error("Stall owner organisation is missing");
    const [stall] = await db
      .select()
      .from(schemaModule.stalls)
      .where(eq(schemaModule.stalls.name, stallData.name))
      .limit(1);
    if (!stall) {
      await db.insert(schemaModule.stalls).values({
        name: stallData.name,
        ownerOrgId: ownerOrganisation.id,
        location: stallData.location,
      });
    }
  }

  const wallets = new Map<string, { id: string; balanceCents: number }>();
  for (const walletData of seedData.wallets) {
    const profile = profiles.get(walletData.profileKey);
    if (!profile) throw new Error(`Missing demo profile for ${walletData.key}`);
    wallets.set(
      walletData.key,
      await ensureWallet(db, schemaModule, "profile", profile.id),
    );
  }
  for (const organisationData of seedData.organisations) {
    const organisation = organisations.get(organisationData.key);
    if (!organisation) {
      throw new Error(`Missing demo organisation for ${organisationData.key}`);
    }
    await ensureWallet(db, schemaModule, "organisation", organisation.id);
  }
  const fundsWallet = await ensureDemoFundsWallet(db, schemaModule);
  const thandiWallet = wallets.get("wallet-thandi");
  if (!thandiWallet) throw new Error("Thandi's wallet is missing");
  if (thandiWallet.balanceCents < thandiStartingBalanceCents) {
    await transfer({
      fromId: fundsWallet.id,
      toId: thandiWallet.id,
      amountCents: thandiStartingBalanceCents - thandiWallet.balanceCents,
      kind: "topup",
      method: "simulated",
      key: `demo-seed-thandi-${randomUUID()}`,
    });
  }

  console.log("Demo accounts:");
  console.table(
    seedData.profiles.map(({ key, role }) => ({
      email: demoAccountEmails[key],
      role,
    })),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
