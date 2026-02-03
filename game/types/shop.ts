import type { ItemId } from './items';

export type ShopOfferTier = 'normal' | 'premium';

export type ShopOfferId =
  | 'supply_bronze_pickaxe'
  | 'supply_bronze_hatchet'
  | 'supply_bronze_sword'
  | 'premium_bag_tab';

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

