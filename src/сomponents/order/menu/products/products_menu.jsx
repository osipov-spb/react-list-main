import React from 'react';
import { Input, Pagination, Row, Col, Card, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MenuBreadcrumb from "./menu_breadcrumb";
import ItemButton from "./item_button";
import FolderButton from "./folder_button";
import PropTypes from 'prop-types';

const { Search } = Input;
const { Text } = Typography;

class _ProductsMenu extends React.Component {
    constructor(props) {
        super(props);
        this.pageSize = 20;
        this.menu = Array.isArray(props.items) ? props.items : [];
        this.state = {
            currentPath: [{
                level: 0,
                index: 'ROOT',
                title: 'Меню'
            }],
            items: this.menu,
            currentPage: 1,
            currentItems: this.menu.slice(0, this.pageSize),
            searchQuery: props.searchQuery || '' // Используем переданный поисковый запрос
        };
    }

    updatePath = (e, level) => {
        let newPath = this.state.currentPath.slice(0, level + 1);
        console.log(newPath)
        this.setState({
            currentPath: newPath
        })
    }

    changePage = (page) => {
        const start = (page - 1) * this.pageSize;
        this.setState({
            currentPage: page,
            currentItems: this.state.items.slice(start, start + this.pageSize)
        });
    };

    openFolder = (e, id = 0, fromBreadcrumb = false, pathIndex = 0) => {
        try {
            if (!fromBreadcrumb) {
                // Клик по папке в списке
                const clickedItem = this.state.currentItems.find(item => item && item.id === id);
                if (!clickedItem || !clickedItem.children) return;

                const newPath = [
                    ...this.state.currentPath,
                    {
                        level: this.state.currentPath.length,
                        index: this.state.items.indexOf(clickedItem),
                        title: clickedItem.title
                    }
                ];

                this.setState({
                    items: clickedItem.children,
                    currentItems: clickedItem.children.slice(0, this.pageSize),
                    currentPath: newPath,
                    currentPage: 1,
                    searchQuery: ''
                });
            } else {
                // Навигация по хлебным крошкам
                if (pathIndex === 'ROOT') {
                    // Возврат в корень
                    this.setState({
                        items: this.menu,
                        currentItems: this.menu.slice(0, this.pageSize),
                        currentPath: [this.state.currentPath[0]],
                        currentPage: 1,
                        searchQuery: ''
                    });
                } else {
                    // Переход на конкретный уровень
                    let currentMenu = this.menu;
                    const newPath = [this.state.currentPath[0]];

                    for (let i = 1; i <= pathIndex; i++) {
                        const pathItem = this.state.currentPath[i];
                        if (!pathItem || !currentMenu[pathItem.index]) {
                            console.error('Invalid navigation path');
                            return;
                        }
                        currentMenu = currentMenu[pathItem.index].children;
                        newPath.push(pathItem);
                        break;
                    }

                    this.setState({
                        items: currentMenu || [],
                        currentItems: (currentMenu || []).slice(0, this.pageSize),
                        currentPath: newPath,
                        currentPage: 1,
                        searchQuery: ''
                    });
                }
            }
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to root on error
            this.setState({
                items: this.menu,
                currentItems: this.menu.slice(0, this.pageSize),
                currentPath: [{
                    level: 0,
                    index: 'ROOT',
                    title: 'Меню'
                }],
                currentPage: 1
            });
        }
    };

    handleSearch = (value) => {
        this.setState({ searchQuery: value });
    };

    componentDidUpdate(prevProps) {
        if (prevProps.searchQuery !== this.props.searchQuery) {
            this.setState({
                searchQuery: this.props.searchQuery,
                currentPage: 1
            });
        }
    }

    render() {
        const { currentItems, currentPath, currentPage, items, searchQuery } = this.state;
        const filteredItems = searchQuery
            ? currentItems.filter(item =>
                item && item.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : currentItems;


        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Хлебные крошки (без заголовка меню) */}
                <Card
                    bordered={false}
                    style={{
                        // marginBottom: '12px',
                        // borderRadius: '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{padding: '12px'}}
                >
                    <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                        {currentPath.map((item, index) => item && (
                            <MenuBreadcrumb
                                key={index}
                                title={item.title}
                                updatePath={this.updatePath}
                                openFolder={this.openFolder}
                                level={item.level}
                                itemIndex={item.index}
                                isLast={index === currentPath.length - 1}
                            />
                        ))}
                    </div>
                </Card>

                {/* Список товаров */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '4px 8px', // Горизонтальный 8px, вертикальный 4px
                    padding: '2px'
                }}>
                    {filteredItems.map((item, index) => item && (
                        <div key={item.id} style={{
                            margin: '0px 0px 0px 0px' // Уменьшаем вертикальные отступы
                        }}>
                            {!item.folder ? (
                                <ItemButton
                                    style={{padding: '4px'}} // Уменьшаем внутренние отступы
                                    data={{
                                        index: index,
                                        id: item.id,
                                        price: item.price,
                                        discount: item.discount,
                                        title: item.title
                                    }}
                                />
                            ) : (
                                <FolderButton
                                    style={{padding: '4px'}} // Уменьшаем внутренние отступы
                                    data={{
                                        index: index,
                                        id: item.id,
                                        discount: item.discount,
                                        title: item.title
                                    }}
                                    openFolder={this.openFolder}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Пагинация */}
                {items.length > this.pageSize && (
                    <div style={{
                        textAlign: 'center',
                        padding: '8px',
                        borderTop: '1px solid #f0f0f0'
                    }}>
                        <Pagination
                            current={currentPage}
                            onChange={this.changePage}
                            total={items.length}
                            pageSize={this.pageSize}
                            showSizeChanger={false}
                            showQuickJumper={false}
                        />
                    </div>
                )}
            </div>
        );
    }
}

_ProductsMenu.propTypes = {
    items: PropTypes.array.isRequired
};

export default _ProductsMenu;