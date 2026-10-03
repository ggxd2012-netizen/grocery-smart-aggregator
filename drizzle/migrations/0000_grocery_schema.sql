CREATE TABLE public.stores (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  min_order numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  free_delivery_over numeric,
  eta_min int NOT NULL DEFAULT 30,
  deeplink text NOT NULL
);
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores public read" ON public.stores FOR SELECT USING (true);

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  brand text,
  size text,
  category text NOT NULL,
  emoji text NOT NULL,
  barcode text UNIQUE,
  tags text[] NOT NULL DEFAULT '{}',
  is_fresh boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);

CREATE TABLE public.product_prices (
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  store_id text REFERENCES public.stores(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  promo_price numeric,
  stock int NOT NULL DEFAULT 20,
  PRIMARY KEY (product_id, store_id)
);
GRANT SELECT ON public.product_prices TO anon, authenticated;
GRANT ALL ON public.product_prices TO service_role;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices public read" ON public.product_prices FOR SELECT USING (true);

CREATE TABLE public.price_history (
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  store_id text REFERENCES public.stores(id) ON DELETE CASCADE,
  day date NOT NULL,
  price numeric NOT NULL,
  PRIMARY KEY (product_id, store_id, day)
);
GRANT SELECT ON public.price_history TO anon, authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history public read" ON public.price_history FOR SELECT USING (true);

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id text REFERENCES public.stores(id) ON DELETE CASCADE,
  code text NOT NULL,
  label_en text NOT NULL,
  label_ar text NOT NULL,
  percent_off numeric NOT NULL DEFAULT 0,
  max_off numeric,
  min_spend numeric NOT NULL DEFAULT 0
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons public read" ON public.coupons FOR SELECT USING (true);

-- user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  notify_whatsapp boolean NOT NULL DEFAULT false,
  notify_push boolean NOT NULL DEFAULT true,
  notify_email boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.basket_items (
  user_id uuid NOT NULL,
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  qty int NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.basket_items TO authenticated;
GRANT ALL ON public.basket_items TO service_role;
ALTER TABLE public.basket_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own basket" ON public.basket_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.wishlist (
  user_id uuid NOT NULL,
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  target_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist" ON public.wishlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  details text NOT NULL,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  strategy text NOT NULL,
  total numeric NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON public.orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.freshness_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  store_id text REFERENCES public.stores(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id, store_id)
);
GRANT SELECT ON public.freshness_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.freshness_ratings TO authenticated;
GRANT ALL ON public.freshness_ratings TO service_role;
ALTER TABLE public.freshness_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings public read" ON public.freshness_ratings FOR SELECT USING (true);
CREATE POLICY "ratings own insert" ON public.freshness_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings own update" ON public.freshness_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ratings own delete" ON public.freshness_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- seed
INSERT INTO public.stores VALUES
('noon','Noon Minutes','#FEEE00',0,9,79,15,'https://minutes.noon.com/'),
('ninja','Ninja','#E4002B',0,7,99,20,'https://ananinja.com/'),
('hungerstation','HungerStation','#FFC107',20,12,120,35,'https://hungerstation.com/'),
('carrefour','Carrefour','#004E9F',50,15,150,60,'https://www.carrefourksa.com/'),
('panda','Panda','#00843D',40,10,100,45,'https://www.panda.com.sa/'),
('lulu','LuLu','#D71920',60,14,200,75,'https://www.luluhypermarket.com/en-sa');

INSERT INTO public.products VALUES
('almarai-milk-1l','Almarai Fresh Milk Full Fat 1L','حليب المراعي طازج كامل الدسم ١ لتر','Almarai','1L','dairy','🥛','6281007020016','{halal}',false),
('almarai-laban-2l','Almarai Laban 2L','لبن المراعي ٢ لتر','Almarai','2L','dairy','🥛','6281007020245','{halal}',false),
('lactose-free-milk','Nadec Lactose-Free Milk 1L','حليب نادك خالي من اللاكتوز ١ لتر','Nadec','1L','dairy','🥛','6281057010012','{halal,lactose_free}',false),
('eggs-30','Fresh White Eggs 30pcs','بيض أبيض طازج ٣٠ حبة','Al Watania','30pcs','dairy','🥚','6281100300301','{halal,keto}',true),
('cheddar','Kraft Cheddar Cheese 500g','جبنة كرافت شيدر ٥٠٠ جم','Kraft','500g','dairy','🧀','6281017310052','{halal,keto}',false),
('bananas','Bananas 1kg','موز ١ كجم',null,'1kg','produce','🍌','2000000000011','{organic}',true),
('tomatoes','Tomatoes 1kg','طماطم ١ كجم',null,'1kg','produce','🍅','2000000000028','{}',true),
('avocado','Avocado Hass 4pcs','أفوكادو هاس ٤ حبات',null,'4pcs','produce','🥑','2000000000035','{organic,keto}',true),
('apples','Red Apples 1kg','تفاح أحمر ١ كجم',null,'1kg','produce','🍎','2000000000042','{}',true),
('chicken','Al Watania Fresh Chicken 1kg','دجاج الوطنية طازج ١ كجم','Al Watania','1kg','meat','🍗','6281100100017','{halal,keto}',true),
('beef-mince','Fresh Beef Mince 500g','لحم بقري مفروم ٥٠٠ جم',null,'500g','meat','🥩','2000000000059','{halal,keto}',true),
('basmati','Abu Kas Basmati Rice 5kg','أرز أبو كاس بسمتي ٥ كجم','Abu Kas','5kg','pantry','🍚','6281006410108','{halal,gluten_free}',false),
('pasta-gf','Barilla Gluten Free Spaghetti 400g','سباغيتي باريلا خالي من الجلوتين ٤٠٠ جم','Barilla','400g','pantry','🍝','8076809523738','{gluten_free}',false),
('olive-oil','Afia Olive Oil 1L','زيت زيتون عافية ١ لتر','Afia','1L','pantry','🫒','6281006450012','{organic,keto}',false),
('dates','Sukkari Dates 1kg','تمر سكري ١ كجم',null,'1kg','pantry','🌴','2000000000066','{halal,organic}',false),
('water-12','Nova Water 330ml x12','مياه نوفا ٣٣٠ مل × ١٢','Nova','12x330ml','beverages','💧','6287001270012','{sugar_free}',false),
('pepsi-diet','Diet Pepsi 6x330ml','دايت بيبسي ٦ × ٣٣٠ مل','Pepsi','6x330ml','beverages','🥤','6281100510014','{sugar_free}',false),
('coffee','Nescafe Gold 200g','نسكافيه جولد ٢٠٠ جم','Nescafe','200g','beverages','☕','7613035585363','{sugar_free}',false),
('bread','L''usine Sliced Bread','خبز لوزين شرائح','L''usine','600g','bakery','🍞','6281031250019','{halal}',false),
('tissue','Fine Tissues 5 boxes','مناديل فاين ٥ علب','Fine','5x200','household','🧻','6281031110016','{}',false);

-- deterministic pseudo-random prices
WITH base(product_id, base) AS (VALUES
 ('almarai-milk-1l',6.5),('almarai-laban-2l',10.5),('lactose-free-milk',8.75),('eggs-30',24),('cheddar',22.5),
 ('bananas',6.95),('tomatoes',5.5),('avocado',18),('apples',9.5),('chicken',21),('beef-mince',29),
 ('basmati',62),('pasta-gf',14.5),('olive-oil',38),('dates',35),('water-12',11),('pepsi-diet',14),
 ('coffee',49),('bread',6),('tissue',25))
INSERT INTO public.product_prices (product_id, store_id, price, promo_price, stock)
SELECT b.product_id, s.id,
  round((b.base * (0.88 + (abs(hashtext(b.product_id||s.id)) % 25)/100.0))::numeric, 2),
  CASE WHEN abs(hashtext(s.id||b.product_id)) % 5 = 0 THEN round((b.base * 0.82)::numeric,2) END,
  CASE WHEN abs(hashtext(b.product_id||'stk'||s.id)) % 9 = 0 THEN 0
       WHEN abs(hashtext(b.product_id||'stk'||s.id)) % 9 = 1 THEN 2 ELSE 25 END
FROM base b CROSS JOIN public.stores s;

INSERT INTO public.price_history (product_id, store_id, day, price)
SELECT pp.product_id, pp.store_id, (current_date - g)::date,
  round((pp.price * (1 + (sin(g/7.0 + abs(hashtext(pp.product_id||pp.store_id))%10) * 0.08)))::numeric, 2)
FROM public.product_prices pp CROSS JOIN generate_series(0, 89) g;

INSERT INTO public.coupons (store_id, code, label_en, label_ar, percent_off, max_off, min_spend) VALUES
('noon','NOON15','15% off with Al Rajhi cards','خصم ١٥٪ مع بطاقات الراجحي',15,30,80),
('ninja','NINJA10','10% off your basket','خصم ١٠٪ على سلتك',10,20,60),
('carrefour','MAF20','20% off over 200 SAR','خصم ٢٠٪ للطلبات فوق ٢٠٠ ريال',20,50,200),
('panda','PANDA5','5% off with SNB','خصم ٥٪ مع الأهلي',5,15,0);