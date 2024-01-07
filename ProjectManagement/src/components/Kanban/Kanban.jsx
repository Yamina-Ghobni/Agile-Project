import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { Box, Button, Container, Stack } from '@mui/material';

import Column from './Column';
import KanModal from './Modal';
import AddColumn from './AddColumn';
import { columnsRawData } from './Data';
import Scrollbar from '../scrollbar';
// import AddIcon from "@mui/icons-material/Add";

const Kanban = () => {
  const [openColModal, setOpenColModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState(
    JSON.parse(window.localStorage.getItem('columns')) || columnsRawData
  );
  const [modal, setModal] = useState(false);

  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) {
      console.log('no destination');
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('index and destination the same');
      return;
    }

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);

      const swapTask = newTaskIds[source.index];
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, swapTask);

      const newColumnsState = columns.map((c) => {
        if (c.id === start.id) {
          c.taskIds = newTaskIds;
          return c;
        }
        return c;
      });

      const newColumnsState2 = [...newColumnsState];
      setColumns(newColumnsState2);
    } else if (finish.taskIds.length < finish.limit) {
      const startTaskIds = Array.from(start.taskIds);
      const [item] = startTaskIds.splice(source.index, 1);

      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, item);

      const newColumnsState = columns.map((c) => {
        if (c.id === start.id) {
          c.taskIds = startTaskIds;
          return c;
        }
        if (c.id === finish.id) {
          c.taskIds = finishTaskIds;
          return c;
        }
        return c;
      });
      const newColumnsState2 = [...newColumnsState];
      setColumns(newColumnsState2);
    }
  };

  const openModal = (data) => {
    const columnId = data.id;
    setModal(columnId);
    setOpen(true);
  };

  const closeModal = () => {
    setModal(false);
    setOpen(false);
  };
  const closeColModal = () => {
    setOpenColModal(false);
  };

  const addTask = (newTask) => {
    setModal(false);
    const updatedColumns = columns.map((column) => {
      if (column.id === newTask.idColumn && column.taskIds.length < 5) {
        column.taskIds.push(newTask);
        return column;
      }
      return column;
    });
    setColumns(updatedColumns);
  };

  const removeTask = (taskId) => {
    const updatedColumns = columns
      .map((column) => ({
        ...column,
        ...{
          taskIds: column.taskIds.filter((task) => task.id !== taskId),
        },
      }))
      .filter((column) => column.taskIds.length >= 0);
    setColumns(updatedColumns);
  };

  const removeColumn = (columnId) => {
    const updatedColumns = columns.filter((item) => item.id !== columnId);
    setColumns(updatedColumns);
  };

  const editTask = (taskId, newTitle, newText) => {
    const updatedColumns = columns.map((column) => ({
      ...column,
      taskIds: column.taskIds.map((task) => {
        if (task.id === taskId) {
          task.title = newTitle;
          task.text = newText;
          return task;
        }
        return task;
      }),
    }));
    setColumns(updatedColumns);
  };

  const addColumn = (newColumn) => {
    setColumns([...columns, newColumn]);
    console.log(columns);
  };

  useEffect(() => {
    window.localStorage.setItem('columns', JSON.stringify(columns));
  }, [columns]);

  return (
    <Container
      // maxWidth={false}
      sx={{
        height: 1,
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <AddColumn
          openModal={openColModal}
          closeModal={closeColModal}
          addColumn={addColumn}
          columnId={columns.length + 1}
        />
        <Button
          //   startIcon={<AddIcon />}
          sx={{
            color: '#000',
            backgroundColor: '#eee',
            textTransform: 'none',
            ':hover': {
              backgroundColor: '#ddd',
            },
            py: 1,
            my: 2,
          }}
          onClick={() => {
            setOpenColModal(true);
          }}
        >
          Add New Column
        </Button>
        <Box>
          {modal && (
            <KanModal
              openModal={open}
              closeModal={closeModal}
              addTask={addTask}
              columnData={modal}
            />
          )}

          <Stack
            //    ref={provided.innerRef}
            // {...provided.droppableProps}
            spacing={2}
            direction="row"
            //  alignItems="flex-start"
            sx={{
              p: 1,
              height: 1,
              maxWidth: '100%',
            }}
          >
            {columns.map((c) => (
              <Column
                columnData={c}
                key={c.name}
                openModal={openModal}
                removeTask={removeTask}
                removeColumn={removeColumn}
                editTask={editTask}
              />
            ))}
          </Stack>
        </Box>
      </DragDropContext>
    </Container>
  );
};

export default Kanban;
