//webhook.service.js: (Este es un caso especial, no es CRUD)
//Función receiveMercadoPagoWebhook(body): (Lógica: Recibe el webhook, verifica el pago con mercadopago.payment.findById(), si está approved, llama a usersRepo.updateUserProfileInDB para activar la cuota y a paymentsRepo.recordPaymentInDB).
//Exportar { receiveMercadoPagoWebhook }.