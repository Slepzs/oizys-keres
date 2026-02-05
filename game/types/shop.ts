import type { ItemId } from './items';

export type ShopOfferTier = 'normal' | 'premium';

export type ShopOfferId =
  | 'supply_mystery_pack'
  | 'supply_bronze_pickaxe'
  | 'supply_bronze_hatchet'
  | 'supply_bronze_sword'
  | 'premium_bag_tab';

export type GachaPackId = 'shopkeeper_starter_pack';

export interface GachaPackDrop {
  itemId: ItemId;
  weight: number;
}

export interface GachaPackDefinition {
  id: GachaPackId;
  name: string;
  description: string;
  itemsPerPack: number;
  drops: readonly GachaPackDrop[];
}

export type ShopPricing =
  | {
      kind: 'fixed';
      currency: 'coins';
      amount: number;
    }
  | {
      kind: 'exponential';
      currency: 'coins';
      baseAmount: number;
      multiplier: number;
      basedOn: 'bag_extra_tabs';
    };

export type ShopOfferEffect =
  | {
      kind: 'grant_item';
      itemId: ItemId;
      quantity: number;
    }
  | {
      kind: 'bag_tab';
      tabs: number;
    }
  | {
      kind: 'open_gacha_pack';
      packId: GachaPackId;
    };

export interface ShopOffer {
  id: ShopOfferId;
  tier: ShopOfferTier;
  name: string;
  description: string;
  icon: string;
  pricing: ShopPricing;
  effect: ShopOfferEffect;
}
