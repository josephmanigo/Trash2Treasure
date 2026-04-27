// Maps each recycling idea ID to its own unique 3D model component.
// Import from here in ARScreen so the model changes per idea tab.

import { PlantPotModel, OrganizerModel, OrigamiBoxModel,
         CircuitBoardModel, TinLanternModel, ToteBagModel,
         RecycleSymbol, GlassTerrariumModel, OrganicCompostModel,
         FurnitureShelfModel, ToyRepairModel, ApplianceModel,
         MODEL_MAP } from './Models3D';
import { BirdFeederModel, VerticalGardenModel, SeedlingModel,
         PaperBeadModel, PencilHolderModel, CompostBinModel,
         PaintedVaseModel, SeedBombModel, PlanterBoxModel,
         DonateBoxModel, SteampunkArtModel, DigitalFrameModel,
         BraidedRugModel } from './IdeaModels';

export const IDEA_MODEL_MAP = {
  // Bottle ideas
  b1:  PlantPotModel,        // Self-Watering Plant Pot
  b2:  BirdFeederModel,      // Bird Feeder
  b3:  VerticalGardenModel,  // Vertical Garden Tower

  // Cup ideas
  c1:  OrganizerModel,       // Desk Organizer
  c2:  SeedlingModel,        // Seedling Starter Kit

  // Paper / Book ideas
  bk1: PaperBeadModel,       // Paper Bead Jewelry
  bk2: OrigamiBoxModel,      // Origami Gift Boxes

  // Electronics
  p1:  CircuitBoardModel,    // E-Waste Drive
  p2:  DigitalFrameModel,    // Digital Photo Frame

  // Fabric
  f1:  ToteBagModel,         // Tote Bag from T-Shirt
  f2:  BraidedRugModel,      // Braided Rug

  // Metal / Tin Can
  tc1: PencilHolderModel,    // Pencil Holder
  tc2: TinLanternModel,      // Candle Lantern

  // Glass / Ceramic
  g1:  GlassTerrariumModel,  // Mini Terrarium
  g2:  PaintedVaseModel,     // Painted Decorative Vase

  // Organic / Food
  o1:  CompostBinModel,      // Compost Bin
  o2:  SeedBombModel,        // Seed Bombs

  // Furniture
  fu1: FurnitureShelfModel,  // Upcycled Bookshelf
  fu2: PlanterBoxModel,      // Garden Planter Box

  // Toys / Sports
  t1:  ToyRepairModel,       // Toy Repair Workshop
  t2:  DonateBoxModel,       // Donation Drive

  // Appliance
  ap1: ApplianceModel,       // Certified E-Waste Recycling
  ap2: SteampunkArtModel,    // Steampunk Art Piece

  // Default / Other
  d1:  CompostBinModel,      // Compost It
  d2:  RecycleSymbol,        // Upcycle Challenge
};

// Re-export category map for convenience
export { MODEL_MAP };
