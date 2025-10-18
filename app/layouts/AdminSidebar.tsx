import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { EditOutlined, DragOutlined, LogoutOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export default function AdminSidebar({
  sidebarItems,
  editSidebar,
  setEditSidebar,
  search,
  setSearch,
  onDragEnd,
  filteredSidebarItems,
  pathname,
  navigate,
  handleLogout
}: any) {
  return (
    <div style={{
      background: '#fff',
      borderRight: '1px solid #eee',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 1001,
      overflowY: 'auto',
      width: 250
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: '1px solid #eee', borderRadius: 4, padding: '4px 8px', fontSize: 14 }}
        />
        <Button
          icon={<EditOutlined />}
          type={editSidebar ? 'primary' : 'default'}
          size="small"
          onClick={() => setEditSidebar(!editSidebar)}
          style={{ marginLeft: 4 }}
        />
      </div>
      <DragDropContext onDragEnd={editSidebar ? onDragEnd : () => {}}>
        <Droppable droppableId="sidebar-menu" isDropDisabled={!editSidebar} isCombineEnabled={false} ignoreContainerClipping={false}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {filteredSidebarItems.map((item: any, index: number) => (
                item.type === 'divider' ? (
                  <div key={`divider-${index}`} style={{ height: 16 }} />
                ) : item.type === 'group' ? (
                  <div key={item.key} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, padding: '8px 16px', color: '#888' }}>
                      {item.label}
                      {editSidebar ? (
                        <DragOutlined style={{ marginLeft: 'auto', color: '#1890ff', cursor: 'grab' }} />
                      ) : (
                        <Button
                          icon={<DragOutlined />}
                          type="text"
                          size="small"
                          style={{ marginLeft: 'auto', color: '#aaa' }}
                          onClick={() => setEditSidebar(true)}
                        />
                      )}
                    </div>
                    {item.children && item.children.map((child: any, childIdx: number) => (
                      <Draggable key={child.key} draggableId={child.key} index={index + childIdx} isDragDisabled={!editSidebar}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...(editSidebar ? provided.dragHandleProps : {})}
                            style={{
                              userSelect: 'none',
                              padding: '8px 16px',
                              margin: '0 0 4px 0',
                              background: pathname === child.key ? '#e6f7ff' : 'transparent',
                              borderRadius: 4,
                              cursor: editSidebar ? 'grab' : 'pointer',
                              opacity: editSidebar ? 1 : 0.95,
                              ...provided.draggableProps.style,
                            }}
                            onClick={() => !editSidebar && navigate(child.key)}
                          >
                            {child.icon} <span style={{ marginLeft: 8 }}>{child.label}</span>
                            {editSidebar && <DragOutlined style={{ float: 'right', color: '#aaa', marginLeft: 8 }} />}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                ) : (
                  <Draggable key={item.key} draggableId={item.key} index={index} isDragDisabled={!editSidebar}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...(editSidebar ? provided.dragHandleProps : {})}
                        style={{
                          userSelect: 'none',
                          padding: '8px 16px',
                          margin: '0 0 4px 0',
                          background: pathname === item.key ? '#e6f7ff' : 'transparent',
                          borderRadius: 4,
                          cursor: editSidebar ? 'grab' : 'pointer',
                          opacity: editSidebar ? 1 : 0.95,
                          ...provided.draggableProps.style,
                        }}
                        onClick={() => !editSidebar && navigate(item.key)}
                      >
                        {item.icon} <span style={{ marginLeft: 8 }}>{item.label}</span>
                        {editSidebar && <DragOutlined style={{ float: 'right', color: '#aaa', marginLeft: 8 }} />}
                      </div>
                    )}
                  </Draggable>
                )
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div style={{ padding: '16px 8px', borderTop: '1px solid #eee' }}>
        <Tooltip title="Logout" placement="right">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ width: '100%', height: '40px' }}
            danger
          />
        </Tooltip>
      </div>
    </div>
  );
}
