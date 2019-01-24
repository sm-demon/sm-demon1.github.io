const express = require('express')
const fs = require('fs')
const path = require('path')

// 创建应用
const app = express()

// 配置文件的路径
const PRODUCT_DATA_FILE = path.join(__dirname, 'data/server-product-data.json')
const CART_DATA_FILE = path.join(__dirname, 'data/server-cart-data.json')

// 设置服务器的根目录
app.use(express.static('public'))

// 设置端口
app.set('port', (process.env.PORT || 3000))

// 解析传入的数据
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 设置响应头
app.use((req, res, next) => {


    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    next();
})

app.get('/products', function (req, res) {
    fs.readFile(PRODUCT_DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            throw err
        }
        try {
            data = JSON.parse(data)
        } catch (error) {
            return console.log(error)
        }

        res.json(data)
    })
})


app.get('/cart', function (req, res) {
    fs.readFile(CART_DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            throw err
        }
        try {
            data = JSON.parse(data)
        } catch (error) {
            return console.log(error)
        }

        res.json(data)
    })
})


app.post('/cart', function (req, res) {

    fs.readFile(CART_DATA_FILE, 'utf8', (err, data) => {
        if (err) throw err;
        try {
            data = JSON.parse(data)
        } catch (error) {
            return console.log(error)
        }

        // 将要被放入购物车的商品
        let newCarProduct = {
            id: req.body.id,
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            quantity: 1
        }
        // 购物车中是否有该商品的标识, false 表示购物车中没有该商品
        let cartProductExists = false;

        // 判断购物车中是否存在该商品，如果存在，数量加一
        data.map(cartProduct => {
            if (cartProduct.id === newCarProduct.id) {
                cartProduct.quantity++
                cartProductExists = true;
            }
        })

        // 如果购物车中不存在该商品，则添加到购物车
        if (!cartProductExists) data.push(newCarProduct);

        // 将修改之后的数据写入到文件中
        fs.writeFile(CART_DATA_FILE, JSON.stringify(data, null, 4), () => {

            res.json(data)
        })



    })



})

// 删除某个商品
app.post('/cart/delete', (req, res) => {
    fs.readFile(CART_DATA_FILE, 'utf8', (err, data) => {
        if (err) throw err;
        try {
            data = JSON.parse(data)
        } catch (error) {
            return console.log(error)
        }

        //遍历购物车中的商品
        data.map(cartProduct => {
            // 如果购物车中被删除的商品的数量大于1，则数量减一
            if (cartProduct.id === req.body.id && cartProduct.quantity > 1) {
                cartProduct.quantity--;

                // 如果购物车中被删除的商品数量等于1，则把该商品的信息从购物车中删除
            } else if (cartProduct.id === req.body.id && cartProduct.quantity === 1) {
                const cartIndexToRemove = data.findIndex(cartProduct => cartProduct.id === req.body.id)
                data.splice(cartIndexToRemove, 1)
            }
        })

        // 将修改之后的数据写回到文件中
        fs.writeFile(CART_DATA_FILE, JSON.stringify(data, null,4), () => {
            res.json(data)
        })
    })
})

// 删除购物车中的所有商品
app.post('/cart/delete/all', function (req, res) {
    const emptyCart = [];

    fs.writeFile(CART_DATA_FILE, JSON.stringify(emptyCart, null, 4), () => {
        res.json(emptyCart)
    })
})


app.listen(app.get('port'), () => {
    console.log(`服务器开启成功--->http://localhost:${app.get('port')}`)
})