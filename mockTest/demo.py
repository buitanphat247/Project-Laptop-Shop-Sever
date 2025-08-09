import json
from unidecode import unidecode

# Đọc dữ liệu từ file JSON
def load_data(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

# Ghi dữ liệu ra file JSON
def save_data(filename, data):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Hiển thị danh sách bài viết
def list_news(news_list):
    for news in news_list:
        print(f"{news['id']}: {news['title']}")

# Hiển thị danh sách sản phẩm
def list_products(product_list):
    for product in product_list:
        print(f"{product['id']}: {product.get('name', 'No name')}")

# Chỉnh sửa một trường của bài viết
def edit_news(news):
    print("Các trường có thể sửa: title, desc, content, thumbnail, published")
    field = input("Nhập tên trường muốn sửa: ")
    if field in news:
        print(f"Giá trị hiện tại: {news[field]}")
        new_value = input("Nhập giá trị mới: ")
        # Kiểm tra kiểu dữ liệu nếu cần
        if field == "published":
            new_value = new_value.lower() in ['true', '1', 'yes']
        news[field] = new_value
        print("Đã cập nhật.")
    else:
        print("Trường không hợp lệ.")

# Chỉnh sửa một trường của sản phẩm
def edit_product(product):
    print("Các trường có thể sửa: name, price, desc, ...")
    field = input("Nhập tên trường muốn sửa: ")
    if field in product:
        print(f"Giá trị hiện tại: {product[field]}")
        new_value = input("Nhập giá trị mới: ")
        product[field] = new_value
        print("Đã cập nhật.")
    else:
        print("Trường không hợp lệ.")

def reset_news_ids(news_list):
    for idx, news in enumerate(news_list, start=1):
        news['id'] = idx
    print("Đã cập nhật lại id cho tất cả bài viết.")

def reset_product_ids(product_list):
    for idx, product in enumerate(product_list, start=1):
        product['id'] = idx
    print("Đã cập nhật lại id cho tất cả sản phẩm.")

def reset_permission_ids_and_slug(permission_list):
    for idx, perm in enumerate(permission_list, start=1):
        perm['id'] = idx
        # Chuyển name sang không dấu, viết thường, thay dấu cách bằng -
        slug = unidecode(perm['name']).lower().replace(' ', '-')
        perm['slug'] = slug
    print("Đã cập nhật lại id và slug cho tất cả permissions.")

def main():
    filename = 'backup_2025-07-31T06-12-48-777Z.json'
    data = load_data(filename)
    news_list = data.get('news', [])
    product_list = data.get('products', [])
    permission_list = data.get('permissions', [])

    while True:
        print("\n--- MENU ---")
        print("1. Xem danh sách bài viết")
        print("2. Sửa bài viết")
        print("3. Lưu và thoát")
        print("4. Đánh lại id bài viết từ 1 đến N")
        print("5. Xem danh sách sản phẩm")
        print("6. Sửa sản phẩm")
        print("7. Đánh lại id sản phẩm từ 1 đến N")
        print("8. Đánh lại id và slug cho permissions")  # Thêm dòng này
        choice = input("Chọn: ")

        if choice == '1':
            list_news(news_list)
        elif choice == '2':
            list_news(news_list)
            news_id = int(input("Nhập ID bài viết muốn sửa: "))
            news = next((n for n in news_list if n['id'] == news_id), None)
            if news:
                edit_news(news)
            else:
                print("Không tìm thấy bài viết.")
        elif choice == '3':
            save_data(filename, data)
            print("Đã lưu. Thoát.")
            break
        elif choice == '4':
            reset_news_ids(news_list)
        elif choice == '5':
            list_products(product_list)
        elif choice == '6':
            list_products(product_list)
            product_id = int(input("Nhập ID sản phẩm muốn sửa: "))
            product = next((p for p in product_list if p['id'] == product_id), None)
            if product:
                edit_product(product)
            else:
                print("Không tìm thấy sản phẩm.")
        elif choice == '7':
            reset_product_ids(product_list)
        elif choice == '8':
            reset_permission_ids_and_slug(permission_list)
        else:
            print("Lựa chọn không hợp lệ.")

if __name__ == "__main__":
    main()
