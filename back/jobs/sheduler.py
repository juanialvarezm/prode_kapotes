from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger(__name__)

def start_scheduler(app):
    """Inicia el scheduler con contexto de Flask."""
    from back.services.sync_services import sync_matches
    
    scheduler = BackgroundScheduler()

    def sync_job():
        """Job que se ejecuta con contexto de app."""
        with app.app_context():
            try:
                result = sync_matches(season=2026)
                logger.info(f"✅ Sync completado: {result}")
            except Exception as e:
                logger.error(f"❌ Error en sync: {str(e)}")

    # Sincronizar cada 5 minutos (300 segundos)
    # Esto respeta el rate limit de 300 req/min si solo hacés 1 request por sync
    scheduler.add_job(
        func=sync_job,
        trigger="interval",
        seconds=300,  # 5 minutos
        id="sync_matches_job",
        replace_existing=True
    )

    scheduler.start()
    logger.info("🕐 Scheduler iniciado: sincronización cada 5 minutos")