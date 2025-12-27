/**
 * Компонент для обработки 404 ошибок
 */
const NotFound = () => {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404 - Страница не найдена</h1>
            <p>Запрашиваемая страница не существует.</p>
        </div>
    );
};

export default NotFound;

