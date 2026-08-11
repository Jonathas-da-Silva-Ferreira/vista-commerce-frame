package main

import "github.com/gin-gonic/gin"

func main() {
    router := gin.Default()

    router.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "success": true,
            "message": "Vista Commerce API iniciada com sucesso!",
        })
    })

    router.Run(":8080")
}
