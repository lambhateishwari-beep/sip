"""Builds the starting menu (read from the printed menu card photos).
Run:  python3 tools/build_menu.py
Writes lib/default-menu.json and public/default-menu.json
"""
import json, os

V, N, X = "veg", "nonveg", ""
cats = []


def cat(cid, name, group="food"):
    c = {"id": cid, "name": name, "group": group, "hidden": False, "items": []}
    cats.append(c)
    return c


def add(c, section, typ, rows, size_labels=None):
    """rows: (name, price) | (name, price, desc) | (name, [p1,p2], desc)"""
    for r in rows:
        name, price = r[0], r[1]
        desc = r[2] if len(r) > 2 else ""
        if isinstance(price, list):
            prices = [{"label": l, "price": p} for l, p in zip(size_labels, price)]
        else:
            prices = [{"label": "", "price": price}]
        n = sum(len(x["items"]) for x in cats) + 1
        c["items"].append({
            "id": "i%03d" % n, "name": name, "desc": desc, "section": section,
            "type": typ, "available": True, "prices": prices,
        })


# ---------- Starters
c = cat("starters", "Starters")
add(c, "Veg", V, [("Cube Pizza Pocket", 110), ("Bombay Crispy Fry", 110), ("Cheese Kurkure", 140),
                  ("Veg Cutlet", 140), ("Cheese Pakoda", 145), ("Cheese Pizza Pocket", 150),
                  ("Veg Fingers", 150), ("Cottage Paneer", 155), ("Hara Bhara Kabab", 160),
                  ("Cheese Cherry Pineapple", 165)])
add(c, "Non Veg", N, [("Chicken Sausages", 140), ("Fish Fingers", 160), ("Chicken Balls", 180),
                      ("BBQ Chicken Wings", 180), ("Fried Crab", 180), ("Peri Peri Chicken Wings", 200),
                      ("Fried Chicken Basket", 380), ("Cheesy Chicken Basket", 405)])

# ---------- Combos
c = cat("combos", "TGS Combo Special")
add(c, "Veg", V, [("Veg Burger Combo", 149, "1 Burger, Fries, Mocktail"),
                  ("Sandwich Combo Veg", 159, "Fries, Sandwich, Coke"),
                  ("Pizza Combo Veg", 189, "Exotic Paneer Pizza, 1 Mocktail, Cheese Bowl")])
add(c, "Non Veg", N, [("Non-Veg Burger Combo", 209, "1 Burger, Fries, Mocktail"),
                      ("Sandwich Combo Non-Veg", 249, "Fries, Sandwich, Coke"),
                      ("Pizza Combo Non-Veg", 299, "Non-Veg Pizza, 1 Mocktail, Cheese Bowl")])

# ---------- Pizza
S = ["7 inch", "10 inch"]
c = cat("pizza", "Pizza")
add(c, "Veg", V, [
    ("Margherita", [89, 175], "Single Cheese Topping"),
    ("Cheese Corn", [89, 175], "Cheese & Corn"),
    ("Mix Veggie", [99, 189], "Tomato, Onion, Corn"),
    ("Exotic Paneer", [99, 199], "Cheese & Flavoured Paneer"),
    ("Farm Fresh", [199, 359], "Capsicum, Onion, Corn, Mushroom"),
    ("BBQ Magic Mushroom", [199, 359], "Onion, Corn, Mushroom"),
    ("Schezwan Veg Spicy", [199, 359], "Onion, Capsicum, Corn, Spring Onion"),
    ("Peri Peri Paneer", [239, 399], "Paneer, Olive, Jalapenos, Bellpepper"),
    ("Paneer Makhni", [239, 399], "Makhni Paneer, Capsicum, Onion, Corn, Coriander"),
    ("Tandoori Paneer", [239, 399], "Tandoori Paneer, Bellpepper, Veggies, Onion, Green Chilli"),
    ("Veg Overload", [269, 479], "Paneer, Mushroom, Bellpepper, Veggies, Babycorn, Onion"),
    ("Mexican Supreme", [269, 479], "Nachos, Jalapenos, Olive, Bellpepper"),
    ("The Golden Sip Special", [269, 479], "Paneer, Bellpepper, Olive, Mushroom, Babycorn"),
], S)
add(c, "Non Veg", N, [
    ("Cheesy Chicken", [179, 289], "Cheese & Grilled Chicken"),
    ("Chicken Sausage", [179, 289], "Cheese & Chicken Sausages"),
    ("BBQ Chicken BBQ", [249, 399], "Chicken, Mushroom, Onion"),
    ("Kheema Chicken", [229, 349], "Chicken Kheema, Onion, Coriander"),
    ("Schezwan Chicken Spicy", [229, 379], "Chicken, Onion, Corn, Capsicum, Spring Onion"),
    ("Chicken Peri Peri Peri Peri", [269, 469], "Chicken, Olives, Jalapenos, Capsicum"),
    ("Chicken Makhni", [269, 469], "Chicken Makhni, Capsicum, Onion, Corn"),
    ("Tandoori Chicken", [269, 469], "Chicken Tandoori, Bellpepper, Onion, Green Chilli"),
    ("Overload Chicken", [309, 589], "Chicken Sausages, Chicken Kheema, Roasted Chicken, Bell pepper"),
    ("Mexican Chicken", [309, 589], "Chicken Sausages, Nachos, Jalapenos, Olive, Bellpepper"),
    ("Special TGS Non Veg", [309, 589], "Salami Chicken, Chicken Sausages, Olive, Mushroom, Baby Corn, Bellpepper"),
], S)

# ---------- Burgers & Fries
c = cat("burgers", "Burgers & Fries")
add(c, "Veg Burger", V, [("Veg Burger", 89), ("BBQ Veg Burger", 109), ("Spice Paneer Burger", 139),
                         ("TGS Bigshow Burger", 159), ("BBQ Paneer Steak Burger", 129)])
add(c, "Non Veg Burger", N, [("Chicken Burger", 109), ("BBQ Chicken Burger", 129),
                             ("Spice Chicken Burger", 139), ("TGS Bigshow Burger", 149)])
add(c, "Fries", V, [("French Fries", 79), ("Peri Peri Fries", 109), ("Chipotle Fries", 119),
                    ("Cheesy Peri Peri Fries", 129), ("Double Coated Fries", 119),
                    ("Double Coated Cheese Fries", 159)])
add(c, "Finger Bites", V, [("Nachos With Cheese & Salsa", 129), ("Cheese Balls", 129),
                           ("Cheese Corn Balls", 149), ("Jalapeno Cheese Balls", 149)])

# ---------- Sandwiches
c = cat("sandwiches", "Sandwiches")
add(c, "Veg", V, [("Veg Sandwich", 89), ("Veg Cheese Sandwich", 99), ("Toast Bread Butter", 69),
                  ("Veg Club Sandwich", 120), ("Cheese Grill Sandwich", 120), ("Paneer Tikka Sandwich", 149),
                  ("Chocolate Sandwich", 129), ("Open Cheese Sandwich", 149), ("BBQ Paneer Sandwich", 159),
                  ("Cheese Garlic Bread", 119), ("Cheese Chilly Toast", 119)])
add(c, "Non Veg", N, [("Chicken Sandwich", 159), ("Chicken Grill Sandwich", 169),
                      ("Chicken Cheese Grill Sandwich", 179), ("BBQ Grill Chicken Sandwich", 189)])

# ---------- Fresh & Healthy
c = cat("fresh", "Pasta, Rice & Salads")
add(c, "Pasta", V, [("Alfredo White Sauce Pasta", 199), ("Arrabbiata Red Sauce Pasta", 199),
                    ("Spaghetti Veg (White Sauce)", 199), ("Spaghetti Veg (Red Sauce)", 199),
                    ("Spaghetti Veg (Mix Sauce)", 199), ("Primavera (Mix Sauce)", 199)])
add(c, "Golden Bowl", V, [("Tawa Pulav", 135), ("Dry Fruit Tawa Pulav", 145),
                          ("Golden Ghee Tawa Pulav", 155), ("Cheese Tawa Pulav", 165)])
add(c, "Veg Salad", V, [("Fruit Salad", 135), ("Fruit Salad With Cream", 145), ("Veg Salad", 89),
                        ("Russian Salad", 170), ("Greek Salad", 160)])
add(c, "Non Veg Salad", N, [("Chicken Salad", 200), ("Chicken Greek Salad", 239)])

# ---------- Not on the printed card (owner can fill these in from the admin panel)
cat("parathas", "Parathas & Desi")

# ---------- Maggie
c = cat("maggie", "Maggie")
add(c, "", V, [("Veg Maggie", 40), ("Veg Peri Peri Maggie", 50), ("Veg Cheese Maggie", 60)])
add(c, "", N, [("Egg Maggie", 80)])

# ---------- Momos
c = cat("momos", "Momos")
add(c, "Veg Momos", V, [("Veg Momos (5 Pcs)", 50), ("Veg Fried Momos (5 Pcs)", 70),
                        ("Veg Paneer Fried Momos (5 Pcs)", 80)])
add(c, "Non Veg Momos", N, [("Chicken Momos (5 Pcs)", 70), ("Chicken Fried Momos (5 Pcs)", 90)])

# ---------- Quick bites & desserts
c = cat("quickbites", "Quick Bites & Desserts", "bev")
add(c, "Quick Bites", V, [("Bread Butter", 55), ("Browny Cake", 60), ("Jam Bread", 25), ("Cookies", 20),
                          ("Chocolate Cookies", 25), ("Classic Bun Maska", 35), ("Mango Bun Maska", 45),
                          ("Blueberry Bun Maska", 55), ("Rose Pistachio Bun Maska", 60),
                          ("Chocolate Bun Maska", 49), ("Kesar Bun Maska", 49)])
add(c, "Gourmet Desserts", V, [("Fruit Salad with Ice Cream", 159), ("Strawberry with Cream", 159),
                               ("Titonic Sundae / Triple Sundae", 159), ("Sizzling Brownie", 249),
                               ("Special Ice Cream Bowl", 249)])

cat("icecream", "Ice Cream", "bev")

# ---------- Hot beverages
c = cat("hot", "Hot Beverages", "bev")
add(c, "Premium Teas", X, [("Special Tea", 20), ("Black Tea", 20), ("Green Tea", 25),
                           ("Lemon Tea", 30), ("Cardamom Tea", 25)])
add(c, "Coffees", X, [("Nescafe", 35), ("Black Coffee", 25), ("Americano", 80), ("Cappuccino", 90),
                      ("Cafe Latte", 99), ("Espresso (Small)", 50), ("Espresso (Big)", 79),
                      ("Vanilla Cappuccino", 110), ("Vanilla Cafe Latte", 119), ("Iris Cappuccino", 110),
                      ("Iris Cafe Latte", 119), ("Hazelnut Cafe Latte", 110), ("Hazelnut Cappuccino", 119),
                      ("Cafe Machito Small", 49), ("Cafe Machito Large", 79), ("Iris Americano", 79),
                      ("Chocolate Cappuccino", 110), ("Caramel Latte", 149), ("Caramel Cappuccino", 149)])
add(c, "TGS Special Hot Beverages", X, [("Classic Hot Chocolate", 80), ("Espresso Hot Chocolate", 90),
                                        ("Wipe Hot Chocolate", 99)])

# ---------- Cold beverages
c = cat("cold", "Cold Beverages", "bev")
add(c, "Cold Beverages", X, [("Cafe Frappe", 70), ("Dark Frappe", 90), ("Cold Crunchy Frappe", 99),
                             ("Special Golden Sip Frappe", 120)])
add(c, "Signature", X, [("Ferrero Rocher Shake", 199), ("Brownie Burst Shake", 149), ("Choco Blast", 199),
                        ("Oreo Shake", 119), ("Kitkat Shake", 119), ("Lassi", 50), ("Kesar Lassi", 60),
                        ("Mango Lassi", 60), ("Butter Milk", 40), ("Bournvita Full", 60),
                        ("Bournvita Half", 30)])

# ---------- Shakes
c = cat("shakes", "Shakes, Mastani & Falooda", "bev")
add(c, "Milk Shakes", X, [("Vanilla Milk Shake", 80), ("Strawberry Milk Shake", 80), ("Mango Milk Shake", 90),
                          ("Chocolate Milk Shake", 99), ("Apple Milk Shake", 109),
                          ("Butter Scotch Milk Shake", 109), ("Kesar Milk Shake", 119),
                          ("Dryfruit Shake", 135), ("Truffle Milk Shake", 135), ("Biscoff Milk Shake", 135),
                          ("Pista Milk Shake", 135)])
add(c, "Mastani Special", X, [("Mango Mastani", 149), ("Pista Mastani", 149), ("Butter Scotch Mastani", 149),
                              ("Chocolate Mastani", 149), ("Strawberry Mastani", 149),
                              ("Kesar Pista Mastani", 149), ("Keshar Badam Mastani", 149),
                              ("Dry Fruit Mastani", 159), ("Special TGS Mastani", 169)])
add(c, "Falooda Special", X, [("Kesar Falooda", 149), ("Pista Falooda", 149), ("Rose Falooda", 149),
                              ("Special Falooda", 169)])

# ---------- Mocktails & juice
c = cat("mocktails", "Mocktails & Juice", "bev")
add(c, "Mocktails", X, [("Virgin Mojito", 90), ("Water Melon Mojito", 90), ("Blue Berry", 90),
                        ("Kala Khatta", 90), ("Green Angel", 90), ("Guava Merry", 129),
                        ("Strawberry Sunshine", 90), ("Kiwi Fizz", 90), ("Cran Berry", 90),
                        ("Blue Angel", 90), ("Virgin Pina Colada", 109), ("Fruit Punch", 129)])
add(c, "Fresh Fruit Juices", X, [("Mosambi Juice", 99), ("Orange Juice", 99), ("Pineapple Juice", 99),
                                 ("Maramari Mix", 99), ("Mango Juice", 99), ("Ganga Jamuna", 99),
                                 ("Apple Juice", 129), ("Anjam Juice", 139)])

menu = {"categories": cats}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for p in ("lib/default-menu.json", "public/default-menu.json"):
    with open(os.path.join(root, p), "w", encoding="utf-8") as f:
        json.dump(menu, f, ensure_ascii=False, indent=1)
print(len(cats), "categories,", sum(len(x["items"]) for x in cats), "items")
