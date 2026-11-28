import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URI = 'mongodb+srv://shubhankarpatel2004_db_user:GlM5LE0eaRSDS3T9@cluster0.ugffxs0.mongodb.net/feathertown?retryWrites=true&w=majority&appName=Cluster0'

client = AsyncIOMotorClient(MONGO_URI)
db = client['feathertown']
orders_col = db['orders']
invoices_col = db['invoices']
transactions_col = db['transactions']
customers_col = db['customers']
accessories_col = db['accessories']

async def run_sync():
    orders = await orders_col.find({}).to_list(length=1000)
    print(f'Found {len(orders)} orders')
    for o in orders:
        order_id = o['_id']
        order_num = o.get('orderNumber') or str(order_id)
        amt = float(o.get('amount') or 0)
        customer = o.get('customer') or {}
        p_status = str(o.get('paymentStatus') or '').lower()
        p_method = str(o.get('paymentMethod') or 'COD').upper()
        o_status = str(o.get('orderStatus') or 'confirmed').lower()
        created_at = o.get('createdAt') or datetime.now(timezone.utc)
        updated_at = o.get('updatedAt') or created_at

        # Backfill category on items
        items = o.get('items') or o.get('orderItems') or []
        updated_items = []
        for it in items:
            cat = it.get('category')
            if not cat:
                acc_id = it.get('accessory') or it.get('id') or it.get('_id')
                if acc_id:
                    acc = await accessories_col.find_one({'_id': acc_id})
                    if acc and acc.get('category'):
                        cat = acc.get('category')
                if not cat:
                    cat = 'Accessories'
                it['category'] = cat
            updated_items.append(it)

        await orders_col.update_one({'_id': order_id}, {'$set': {'items': updated_items}})
        print(f'Updated items category for order {order_num}')

        # Invoice
        inv = await invoices_col.find_one({'$or': [{'orderId': order_id}, {'orderNumber': order_num}]})
        is_paid = p_status in ['paid', 'delivered'] or o_status == 'delivered' or p_method != 'COD'
        if not inv:
            inv_items = []
            for it in updated_items:
                inv_items.append({
                    'name': it.get('name', 'Store Item'),
                    'category': it.get('category', 'Accessories'),
                    'price': float(it.get('price') or 0),
                    'quantity': int(it.get('quantity') or 1),
                    'total': float(it.get('price') or 0) * int(it.get('quantity') or 1),
                    'itemType': 'accessory',
                })
            inv_doc = {
                'invoiceNumber': f'FT-INV-{order_num}',
                'orderId': order_id,
                'orderNumber': order_num,
                'customer': customer,
                'items': inv_items,
                'subtotal': amt,
                'taxRate': 0.0,
                'taxAmount': 0.0,
                'discount': 0.0,
                'totalAmount': amt,
                'paidAmount': amt if is_paid else 0.0,
                'balanceDue': 0.0 if is_paid else amt,
                'paymentStatus': 'paid' if is_paid else ('pending' if p_method == 'COD' else 'paid'),
                'paymentMethod': p_method,
                'status': 'issued',
                'notes': f'Tax Invoice for website order #{order_num} via {p_method}',
                'terms': 'Official FeatherTown Store Tax Invoice. All items verified.',
                'createdAt': created_at,
                'updatedAt': updated_at,
            }
            await invoices_col.insert_one(inv_doc)
            print(f'Created invoice FT-INV-{order_num}')

        # Transaction
        txn = await transactions_col.find_one({'$or': [{'orderId': order_id}, {'reference': order_num}]})
        cust_name = customer.get('name', 'Customer')
        if not txn:
            txn_doc = {
                'transactionId': f'TXN-{order_num}',
                'orderId': order_id,
                'type': 'income',
                'category': 'Store Sales',
                'amount': amt,
                'description': f'Website Order #{order_num} - {cust_name}',
                'reference': order_num,
                'paymentMethod': p_method,
                'customerOrPayee': cust_name,
                'date': created_at,
                'createdAt': created_at,
                'updatedAt': updated_at,
            }
            await transactions_col.insert_one(txn_doc)
            print(f'Created transaction TXN-{order_num}')

        # Customer
        phone = str(customer.get('phone') or '').strip()
        email = str(customer.get('email') or '').strip().lower()
        if phone or email:
            cq = {}
            if phone:
                cq['phone'] = phone
            elif email:
                cq['email'] = email
            await customers_col.update_one(
                cq,
                {
                    '$set': {
                        'name': customer.get('name', 'Customer'),
                        'phone': phone,
                        'email': email,
                        'address': customer.get('address', ''),
                        'city': customer.get('city', ''),
                        'state': customer.get('state', ''),
                        'pincode': customer.get('pincode', ''),
                        'lastOrderAt': created_at,
                        'updatedAt': updated_at,
                    },
                    '$setOnInsert': {
                        'totalOrders': 1,
                        'totalSpent': amt,
                        'createdAt': created_at,
                    },
                },
                upsert=True
            )
            print(f'Synced customer {cust_name}')

if __name__ == '__main__':
    asyncio.run(run_sync())
